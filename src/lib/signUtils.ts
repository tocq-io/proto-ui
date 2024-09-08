import { getUserId } from '$lib/graphUtils';
let signDb: IDBDatabase;
export function openDB() {
	const DBOpenRequest = indexedDB.open('identity');
	DBOpenRequest.onsuccess = (e) => {
		if (e.target) {
			signDb = (<IDBOpenDBRequest>e.target).result;
		}
	};
	DBOpenRequest.onupgradeneeded = (e) => {
		if (e.target) {
			signDb = (<IDBOpenDBRequest>e.target).result;
			signDb.createObjectStore('keypairs', { keyPath: 'id' });
		}
	};
}
export function resetKeys() {
	indexedDB.deleteDatabase('identity');
}
function storeKeyPair(id: string, keys: CryptoKeyPair) {
	const store = signDb.transaction('keypairs', 'readwrite').objectStore('keypairs');
	store.add({ id: id, keys: keys });
}
async function getKeyPair(id: string): Promise<CryptoKeyPair> {
	return new Promise<CryptoKeyPair>((resolve, reject) => {
		let keys: CryptoKeyPair;
		const tx = signDb.transaction('keypairs', 'readonly');
		tx.oncomplete = () => resolve(keys);
		tx.onerror = (event) => {
			if (event.target) {
				reject(tx.error);
			}
		};
		const store = tx.objectStore('keypairs');
		const request = store.get(id);
		request.onsuccess = () => (keys = request.result.keys);
	});
}
export async function initKeyPair(): Promise<string> {
	// TODO use proper user onboarding to set a key
	const keyPair = await crypto.subtle.generateKey(
		{
			name: 'RSASSA-PKCS1-v1_5',
			// Consider using a 4096-bit key for systems that require long-term security
			modulusLength: 2048,
			publicExponent: new Uint8Array([1, 0, 1]),
			hash: 'SHA-256'
		},
		false,
		['sign', 'verify']
	);
	const pubKey = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
	const enc = new TextEncoder();
	const pubKeyString = await quickHash(enc.encode(pubKey.n));
	storeKeyPair(pubKeyString, keyPair);
	return pubKeyString;
}
export async function digestFile(fileArrayBuffer: ArrayBuffer): Promise<string> {
	const keys = await getUserId().then((userId) => getKeyPair(userId));
	const MAX_F_SIZE = 8e+6; // 8MB
	if (keys === undefined) return '';
	if (fileArrayBuffer.byteLength < MAX_F_SIZE) {
		return digestBuffer(fileArrayBuffer, keys);
	} else {
		const noSlices = Math.ceil(fileArrayBuffer.byteLength / MAX_F_SIZE);
		const arrBoundaries = Array.from({ length: noSlices }, (_, i) => i * MAX_F_SIZE);
		const DIGEST_LENGTH = 256; // length of RSASSA-PKCS1-v1_5 digest
		let flattArray = new ArrayBuffer(noSlices * DIGEST_LENGTH);
		let flattView = new Uint8Array(flattArray);
		await Promise.all(arrBoundaries.map(async (boundary, i, arr) => {
			const byteSlice = i < noSlices ? fileArrayBuffer.slice(boundary, arr[i + 1]) : fileArrayBuffer.slice(boundary, fileArrayBuffer.byteLength);
			const digBuff = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', keys.privateKey, byteSlice);
			flattView.set(new Uint8Array(digBuff), i * DIGEST_LENGTH);
		}));
		return quickHash(flattArray);
	}
}
export async function digestString(data: string): Promise<string> {
	const enc = new TextEncoder();
	const dataUint8 = enc.encode(data); // encode as (utf-8) Uint8Array
	const keys = await getUserId().then((userId) => getKeyPair(userId));
	if (keys === undefined) return '';
	return digestBuffer(dataUint8, keys);
}
export async function stringHash(str: string): Promise<string> {
	const enc = new TextEncoder();
	const dataUint8 = enc.encode(str); // encode as (utf-8) Uint8Array
	return quickHash(dataUint8); // convert bytes to hex string
}
async function quickHash(value: ArrayBuffer): Promise<string> {
	const hashBuffer = await crypto.subtle.digest('SHA-1', value); // quickly hash the value
	const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
	return hashArray.map((b) => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
}
async function digestBuffer(buffer: ArrayBuffer, keys: CryptoKeyPair): Promise<string> {
	const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', keys.privateKey, buffer);
	return quickHash(signature);
}

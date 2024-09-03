import { getUserId } from '$lib/graphUtils';
let signDb: IDBDatabase;
export function openSignDB() {
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
export async function digestFile(file: File): Promise<[string, Uint8Array]> {
	const fileUint8 = await file.arrayBuffer(); // encode as (utf-8) Uint8Array
	return getUserId().then((userId) => digestBuffer(fileUint8, userId));
}
export async function digestString(data: string): Promise<[string, Uint8Array]> {
	const enc = new TextEncoder();
	const dataUint8 = enc.encode(data); // encode as (utf-8) Uint8Array
	return getUserId().then((userId) => digestBuffer(dataUint8, userId));
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
async function digestBuffer(buffer: ArrayBuffer, userId: string): Promise<[string, Uint8Array]> {
	const keys = await getKeyPair(userId);
	if (keys === undefined) return ['', new Uint8Array(0)];
	const rsArr = new Uint8Array(16);
	const randomSalt = crypto.getRandomValues(rsArr);
	var saltedBuffer = new Uint8Array(buffer.byteLength + randomSalt.byteLength);
	saltedBuffer.set(new Uint8Array(buffer), 0);
	saltedBuffer.set(new Uint8Array(randomSalt), buffer.byteLength);
	const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', keys.privateKey, saltedBuffer);
	return [await quickHash(signature), saltedBuffer];
}

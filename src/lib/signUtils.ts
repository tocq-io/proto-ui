let db: IDBDatabase;
export async function openDB() {
	const DBOpenRequest = indexedDB.open('identity');
	DBOpenRequest.onsuccess = (e) => {
		if (e.target) {
			db = (<IDBOpenDBRequest>e.target).result;
		}
	};
	DBOpenRequest.onupgradeneeded = (e) => {
		if (e.target) {
			console.log('Fresh DB created');
			db = (<IDBOpenDBRequest>e.target).result;
			db.createObjectStore('keypairs', { keyPath: 'id' });
		}
	};
}
async function storeKeyPair(id: string, keys: CryptoKeyPair) {
	console.log('Adding a new key pair');
	const store = db.transaction('keypairs', 'readwrite').objectStore('keypairs');
	store.add({ id: id, keys: keys });
}
async function getKeyPair(id: string): Promise<CryptoKeyPair | undefined> {
	const promise = new Promise<CryptoKeyPair>((resolve, reject) => {
		let keys: CryptoKeyPair;
		const tx = db.transaction('keypairs', 'readonly');
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
	let keys;
	try {
		keys = await promise;
	} catch (error) {
		console.log(error);
		return undefined;
	}
	return keys;
}
export async function initKeyPair(): Promise<string> {
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
	await storeKeyPair(pubKeyString, keyPair);
	return pubKeyString;
}
export async function digestFile(file: File, userId: string): Promise<string> {
	const fileUint8 = await file.arrayBuffer(); // encode as (utf-8) Uint8Array
	return digestBuffer(fileUint8, userId);
}
async function quickHash(value: ArrayBuffer): Promise<string> {
	const hashBuffer = await crypto.subtle.digest('SHA-1', value); // quickly hash the value
	const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
	return hashArray.map((b) => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
}
export async function digestBuffer(buffy: ArrayBuffer, userId: string): Promise<string> {
	const keys = await getKeyPair(userId);
	if (keys === undefined) return '';
	const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', keys.privateKey, buffy);
	console.log(signature);
	return quickHash(signature);
}

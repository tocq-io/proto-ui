import { Surreal, StringRecordId } from 'surrealdb.js';
import { surrealdbWasmEngines } from 'surrealdb.wasm';
import { initKeyPair } from './signUtils';
// Enable the WebAssembly engines
const db = new Surreal({
	engines: surrealdbWasmEngines()
});
db.connect('mem://', { namespace: 'browser', database: 'proto' });
type User = {
	scope: string;
	identity: {
		key: string;
	};
};
export async function getUserId(): Promise<string> {
	console.log(await db.version());
	// TODO surreal assumes that RecordId generates an array. Could be a bug.
	const record = new StringRecordId('user:browser'); //new RecordId('user', 'browser');
	let user = await db.select<User>(record);
	if (user === undefined) {
		const keyId = await initKeyPair();
		user = await db.create<User>(record, {
			scope: 'Browser Only',
			identity: {
				key: keyId
			}
		});
	}
	console.log(user.identity.key);
	return user.identity.key;
}

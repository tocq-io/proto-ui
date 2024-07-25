import { Surreal, StringRecordId, RecordId } from 'surrealdb.js';
import { surrealdbWasmEngines } from 'surrealdb.wasm';
import { initKeyPair } from './signUtils';
type User = {
	scope: string;
	identity: {
		key: string;
	};
};
type CsvFile = {
	name: string;
};
const db = new Surreal({
	engines: surrealdbWasmEngines()
});
export async function openGraphDb() {
	db.connect('indxdb://configuration', { namespace: 'browser', database: 'proto' });
}
export async function storeCsvFile(csvName: string, id: string) {
	// TODO use UPSERT with v2 of DB
	const csvFile = await db.create<CsvFile>(new RecordId('data', id), {
		name: csvName
	});
	console.log(csvFile);
}
export async function getCsvFileName(id: string): Promise<string> {
	console.log(id);
	const csvFile = await db.select<CsvFile>(new StringRecordId('data:' + id));
	console.log(csvFile);
	return csvFile.name;
}
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
	console.log('Uder ID: ' + user.identity.key);
	return user.identity.key;
}

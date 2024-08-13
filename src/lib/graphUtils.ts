import { Surreal, StringRecordId, RecordId } from 'surrealdb.js';
import { surrealdbWasmEngines } from 'surrealdb.wasm';
import { initKeyPair } from '$lib/signUtils';
type User = {
	scope: string;
	identity: {
		key: string;
	};
};
export type DataFile = {
	format: string;
	fileName: string;
	size: number;
	schema: string[];
};
export type Query = {
	id: RecordId,
	format: string,
	statement: string;
};
const db = new Surreal({
	engines: surrealdbWasmEngines()
});
export async function openGraphDb() {
	await db.connect('indxdb://configuration', { namespace: 'browser', database: 'proto' });
	// TODO make it schemafull
	// .then(
	// 	() => (db.query(
	// 		"DEFINE FIELD in ON TABLE import TYPE record<DataFile>;"
	// 		+ "DEFINE FIELD out ON TABLE import TYPE record<Transformer>;"
	// 		+ "DEFINE INDEX unique_relationships ON TABLE import COLUMNS in, out UNIQUE;").then(
	// 			(result) => (console.log(result)
	// 			))));
}
// Data Files
export async function storeCsvFile(csvHeader: string[], csvSize: number, csvName: string, csvId: string): Promise<DataFile> {
	// TODO use UPSERT with v2 of DB
	return db.create<DataFile>(new StringRecordId('data:' + csvId), {
		format: 'text/csv',
		fileName: csvName,
		size: csvSize,
		schema: csvHeader,
	});
	// const result = await db.query<[DataFile]>(
	// 	"UPSERT type::thing(data, $id) SET format = 'text/csv', fileName = $fileName, size = $size, schema = $schema;",
	// 	{
	// 		id: csvId,
	// 		fileName: csvName,
	// 		size: csvSize,
	// 		schema: csvHeader,
	// 	}
	// );
	// return result[0];
}
export async function getDataFile(id: string): Promise<DataFile> {
	console.log(id);
	return db.select<DataFile>(new StringRecordId('data:' + id));
}
// Transformers
export async function linkQueryToData(dataId: string, queryId: string) {
	const queryString = 'RELATE queries:' + queryId + '->import->data:' + dataId + ';';
	// TODO currently only works with string concat..
	// await db.query('RELATE queries:$tfId->import->data:$dataId;',
	// 	{
	// 		tfId: tfId,
	// 		dataId: dataId,
	// 	}).then((result) => (console.log(result)));

	await db.query(queryString).then((result) => (console.log(result)));
}
export async function getImportedData(queryId:RecordId): Promise<Object[]>{
	//console.log(db.query('SELECT in FROM import;'))
	let result = await db.query<Object[]>('SELECT out FROM import WHERE in = queries:'+queryId.id+';');
	console.log(result);
	return result;
}
export async function getQueries(): Promise<Query[]> {
	return db.select<Query>('queries');
}
export async function storeDfSqlFile(sqlStatement: string, queryId: string): Promise<Query> {
	// TODO use UPSERT with v2 of DB
	const result = await db.create<Query>('queries', {
		id: new RecordId('transfomer', queryId),
		format: 'df/sql',
		statement: sqlStatement,
	});
	console.log(result);
	return result[0];
}
// User
export async function getUserId(): Promise<string> {
	console.log(await db.version());
	// TODO surreal assumes that RecordId generates an array. Could be a bug.
	const record = new StringRecordId('user:browser'); //new RecordId('user', 'browser');
	let user = await db.select<User>(record);
	if (user === undefined) {
		user = await initKeyPair().then((keyId) => {
			return db.create<User>(record, {
				scope: 'Browser Only',
				identity: {
					key: keyId
				}
			})
		});
	}
	console.log('Uder ID: ' + user.identity.key);
	return user.identity.key;
}

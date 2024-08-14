import { Surreal, StringRecordId, RecordId } from 'surrealdb.js';
import { surrealdbWasmEngines } from 'surrealdb.wasm';
import { initKeyPair } from '$lib/signUtils';
type User = GeneralResult & {
	scope: string;
	identity: {
		key: string;
	};
};
export type DataFile = GeneralResult & {
	format: string;
	fileName: string;
	size: number;
	schema: string[];
};
export type Query = GeneralResult & {
	format: string;
	statement: string;
};
export type QueryDataEdge = GeneralResult & {
	in: RecordId;
	out: RecordId;
};
export type GeneralResult = {
	id: RecordId,
}
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
	const result = await db.create<DataFile>('data', {
		id: new RecordId('data', csvId),
		format: 'text/csv',
		fileName: csvName,
		size: csvSize,
		schema: csvHeader,
	});
	return result[0];
}
// Transformers
export async function linkQueryToData(dataId: string, queryId: string): Promise<QueryDataEdge[]> {
	const queryString = 'RELATE queries:' + queryId + '->import->data:' + dataId + ';';
	const result =  db.query<QueryDataEdge[]>(queryString);
	return result;
}
export async function getDataGraph(): Promise<GeneralResult[][]> {
	let result = await db.query<GeneralResult[][]>('SELECT * FROM data;SELECT * FROM queries;SELECT * FROM import;');
	return result;
}
export async function storeDfSqlFile(sqlStatement: string, queryId: string): Promise<Query> {
	// TODO use UPSERT with v2 of DB
	const result = await db.create<Query>('queries', {
		id: new RecordId('queries', queryId),
		format: 'df/sql',
		statement: sqlStatement,
	});
	return result[0];
}
// User
export async function getUserId(): Promise<string> {
	console.log(await db.version());
	// TODO surreal assumes that RecordId generates an array. Could be a bug.
	const record = new RecordId('user', 'browser'); //new RecordId('user', 'browser');
	let user = await db.select<User>(record);
	if (user === undefined) {
		user = await initKeyPair().then((keyId) => {
			return db.create<User>('user', {
				id: record,
				scope: 'Browser Only',
				identity: {
					key: keyId
				}
			});
		});
	}
	console.log('Uder ID: ' + user[0].identity.key);
	return user[0].identity.key;
}

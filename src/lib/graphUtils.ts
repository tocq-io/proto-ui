import { Surreal, StringRecordId, RecordId } from 'surrealdb.js';
import { surrealdbWasmEngines } from 'surrealdb.wasm';
import { initKeyPair } from '$lib/signUtils';
type User = {
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
export async function linkQueryToData(dataId: string, queryId: string): Promise<QueryDataEdge> {
	const queryString = 'RELATE queries:' + queryId + '->import->data:' + dataId + ';';
	const result =  await db.query<QueryDataEdge[][]>(queryString);
	return result[0][0];
}
export async function deleteQueryToData(dataId: string, queryId: string) {
	const queryString = 'DELETE queries:' + queryId + '->import WHERE out=data:' + dataId + ';';
	await db.query<QueryDataEdge[][]>(queryString);
}
export async function deleteAllQueryToData( queryId: string) {
	const queryString = 'DELETE queries:' + queryId + '->import;';
	await db.query<QueryDataEdge[][]>(queryString);
}
export async function getDataGraph(): Promise<GeneralResult[][]> {
	let result = await db.query<GeneralResult[][]>('SELECT * FROM data;SELECT * FROM queries;SELECT * FROM import;');
	return result;
}
export async function deleteItAll() {
	await db.query<GeneralResult[][]>('DELETE data;DELETE queries;DELETE import;DELETE user;');
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
export async function updateDfSqlFile(sqlStatement: string, queryId: string): Promise<Query> {
	// TODO use UPSERT with v2 of DB
	const result = await db.merge<Query>(new StringRecordId('queries:' + queryId), {
		statement: sqlStatement,
	});
	return result;
}
export async function deleteDfSqlFile(queryId: string) {
	await db.delete<Query>(new StringRecordId('queries:' + queryId));
}
// User
export async function getUserId(): Promise<string> {
	const record = new StringRecordId('user:' + 'browser'); 
	let user = await db.select<User>(record);
	if (user === undefined) {
		user = await initKeyPair().then((keyId) => {
			return db.create<User>(record, {
				scope: 'Browser Only',
				identity: {
					key: keyId
				}
			});
		});
	}
	console.log(user);
	return user.identity.key;
}

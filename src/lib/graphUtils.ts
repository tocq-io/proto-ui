import { Surreal, StringRecordId, RecordId } from 'surrealdb.js';
import { surrealdbWasmEngines } from 'surrealdb.wasm';
import { initKeyPair } from '$lib/signUtils';
type User = {
	scope: string;
	identity: {
		key: string;
	};
};
export type DataFileRecord = DataFile & GeneralResult;
export type DataFile = TocqNode & {
	tableName: string;
	size: number;
};
export type QueryRecord = QueryData & GeneralResult;
export type QueryData = TocqNode & {
	statement: string;
};
export type InOutEdge = GeneralResult & {
	in: RecordId;
	out: RecordId;
};
export type OutEdges = GeneralResult & {
	out: RecordId[];
};
export type InEdges = GeneralResult & {
	in: RecordId[];
};
export type TocqNode = {
	format: string;
	chartType: string;
	nodeView: number;
	salt?: Uint8Array;
};
export type GeneralResult = {
	id: RecordId;
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
export async function storeDataFile(dataFile: DataFile, digest: string): Promise<DataFileRecord> {
	// TODO use UPSERT with v2 of DB
	const result = await db.create<DataFileRecord>('data', {
		id: new RecordId('data', digest),
		format: dataFile.format,
		tableName: dataFile.tableName,
		size: dataFile.size,
		chartType: dataFile.chartType,
		nodeView: dataFile.nodeView,
		salt: dataFile.salt,
	});
	return result[0];
}
export async function updateDataFile(fileData: DataFile, digest: string): Promise<DataFileRecord> {
	// TODO use UPSERT with v2 of DB
	const result = db.merge<DataFileRecord>(new StringRecordId('data:' + digest), {
		chartType: fileData.chartType,
		nodeView: fileData.nodeView,
	});
	return result;
}
export async function deleteDataRecord(digest: string) {
	return db.delete(new StringRecordId('data:' + digest));
}
export async function deleteAllDataToQuery(digest: string) {
	const queryString = 'DELETE data:' + digest + '<-import;DELETE data:' + digest + '<-show;';
	return db.query(queryString);
}
// Queries
export async function linkQueryToData(dataId: string, digest: string): Promise<InOutEdge> {
	const queryString = 'RELATE queries:' + digest + '->import->data:' + dataId + ';';
	const result = await db.query<InOutEdge[][]>(queryString);
	return result[0][0];
}

export async function deleteQueryToDataImport(digest: string) {
	const queryString = 'DELETE queries:' + digest + '->import;';
	return db.query(queryString);
}
export async function getDataGraph(): Promise<GeneralResult[][]> {
	let result = db.query<GeneralResult[][]>('SELECT * FROM data;SELECT * FROM queries;SELECT * FROM import;');
	return result;
}
export async function deleteItAll() {
	return db.query('REMOVE DATABASE proto;');
}
export async function storeDfSqlFile(queryData: QueryData, digest: string): Promise<QueryRecord> {
	// TODO use UPSERT with v2 of DB
	const result = await db.create<QueryRecord>('queries', {
		id: new RecordId('queries', digest),
		format: queryData.format,
		statement: queryData.statement,
		chartType: queryData.chartType,
		nodeView: queryData.nodeView,
		salt: queryData.salt,
	});
	return result[0];
}
export async function updateDfSqlFile(queryData: QueryData, digest: string): Promise<QueryRecord> {
	// TODO use UPSERT with v2 of DB
	const result = db.merge<QueryRecord>(new StringRecordId('queries:' + digest), {
		statement: queryData.statement,
		chartType: queryData.chartType,
		nodeView: queryData.nodeView
	});
	return result;
}
export async function deleteDfSqlFile(digest: string) {
	return db.delete(new StringRecordId('queries:' + digest));
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
	return user.identity.key;
}

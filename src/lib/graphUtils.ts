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
	position: NodePosition;
};
export type NodePosition = {
	x: number;
	y: number;
};
type FlowView = {
	x: number,
	y: number,
	zoom: number
};
export type GeneralResult = {
	id: RecordId;
};
const surrealDb = new Surreal({
	engines: surrealdbWasmEngines()
});
export async function closeGraphDb() {
	await surrealDb.close();
}
export async function openGraphDb() {
	await surrealDb.connect('indxdb://configuration', { namespace: 'browser', database: 'proto' });
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
	const result = await surrealDb.create<DataFileRecord>('data', {
		id: new RecordId('data', digest),
		format: dataFile.format,
		tableName: dataFile.tableName,
		size: dataFile.size,
		chartType: dataFile.chartType,
		nodeView: dataFile.nodeView,
		position: dataFile.position,
	});
	return result[0];
}
export async function updateDataFile(fileData: DataFile, digest: string): Promise<DataFileRecord> {
	// TODO use UPSERT with v2 of DB
	const result = surrealDb.merge<DataFileRecord>(new StringRecordId('data:' + digest), {
		chartType: fileData.chartType,
		nodeView: fileData.nodeView,
	});
	return result;
}
export async function updateDataFilePosition(position: NodePosition, digest: string): Promise<DataFileRecord> {
	// TODO use UPSERT with v2 of DB
	const result = surrealDb.merge<DataFileRecord>(new StringRecordId('data:' + digest), {
		position: position,
	});
	return result;
}
export async function storeViewPort(x: number, y: number, zoom: number) {
	// TODO use UPSERT with v2 of DB
	const result = surrealDb.merge<FlowView>(new StringRecordId('view:port'), {
		x: x,
		y: y,
		zoom: zoom
	});
	return result;
}
export async function deleteDataRecord(digest: string) {
	return surrealDb.delete(new StringRecordId('data:' + digest));
}
export async function deleteAllDataToQuery(digest: string) {
	const queryString = 'DELETE data:' + digest + '<-import;DELETE data:' + digest + '<-show;';
	return surrealDb.query(queryString);
}
// Queries
export async function linkQueryToData(dataId: string, digest: string): Promise<InOutEdge> {
	const queryString = 'RELATE queries:' + digest + '->import->data:' + dataId + ';';
	const result = await surrealDb.query<InOutEdge[][]>(queryString);
	return result[0][0];
}

export async function deleteQueryToDataImport(digest: string) {
	const queryString = 'DELETE queries:' + digest + '->import;';
	return surrealDb.query(queryString);
}
export async function getDataGraph(): Promise<GeneralResult[][]> {
	let result = surrealDb.query<GeneralResult[][]>('SELECT * FROM data;SELECT * FROM queries;SELECT * FROM import;');
	return result;
}
export async function deleteItAll() {
	return surrealDb.query('REMOVE DATABASE proto;');
}
export async function storeDfSqlFile(queryData: QueryData, digest: string): Promise<QueryRecord> {
	// TODO use UPSERT with v2 of DB
	const result = await surrealDb.create<QueryRecord>('queries', {
		id: new RecordId('queries', digest),
		format: queryData.format,
		statement: queryData.statement,
		chartType: queryData.chartType,
		nodeView: queryData.nodeView,
		position: queryData.position,
	});
	return result[0];
}
export async function updateDfSqlFile(queryData: QueryData, digest: string): Promise<QueryRecord> {
	// TODO use UPSERT with v2 of DB
	const result = surrealDb.merge<QueryRecord>(new StringRecordId('queries:' + digest), {
		statement: queryData.statement,
		chartType: queryData.chartType,
		nodeView: queryData.nodeView
	});
	return result;
}
export async function updateDfSqlFilePosition(position: NodePosition, digest: string) {
	// TODO use UPSERT with v2 of DB
	if (digest !== 'empty_query') {
		const result = surrealDb.merge<QueryRecord>(new StringRecordId('queries:' + digest), {
			position: position,
		});
		return result;
	}
}
export async function deleteDfSqlFile(digest: string) {
	return surrealDb.delete(new StringRecordId('queries:' + digest));
}
// User
export async function getUserId(): Promise<string> {
	const record = new StringRecordId('user:' + 'browser');
	let user = await surrealDb.select<User>(record);
	if (user === undefined) {
		user = await initKeyPair().then((keyId) => {
			return surrealDb.create<User>(record, {
				scope: 'Browser Only',
				identity: {
					key: keyId
				}
			});
		});
	}
	return user.identity.key;
}

import { Surreal, StringRecordId, RecordId } from 'surrealdb.js';
import { surrealdbWasmEngines } from 'surrealdb.wasm';
import { initKeyPair } from '$lib/signUtils';
import { DATA_NODE_TYPE, type ChartViewTable } from './storeUtils';
type User = {
	scope: string;
	identity: {
		key: string;
	};
};
export type DataFile = TocqNode & {
	tableName: string;
	size: number;
};
export type Query = TocqNode & {
	statement: string;
};
export type Chart = TocqNode & {
	type: string;
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
export type TocqNode = GeneralResult & {
	format: string;
	salt: Uint8Array;
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
// Charts
export async function storeChart(digest: string, salt: Uint8Array, chartData: ChartViewTable): Promise<Chart> {
	// TODO use UPSERT with v2 of DB
	const result = await db.create<Chart>('charts', {
		id: new RecordId('charts', digest),
		format: 'vw/chart',
		salt: salt,
		type: chartData.type.toString(),
	});
	return result[0];
}

export async function linkChartToNode(chartId: string, nodeId: string, nodeType: string): Promise<InOutEdge> {
	let queryString: string;
	if (nodeType === DATA_NODE_TYPE) {
		queryString = 'RELATE charts:' + chartId + '->show->data:' + nodeId + ';';
	} else {// if (nodeType === QUERY_NODE_TYPE) {
		queryString = 'RELATE charts:' + chartId + '->show->queries:' + nodeId + ';';
	}
	const result = await db.query<InOutEdge[][]>(queryString);
	return result[0][0];
}
export async function deleteChartRecord(chartId: string) {
	await db.delete(new StringRecordId('charts:' + chartId));
}
export async function deleteAllChartToNode(chartId: string) {
	const queryString = 'DELETE charts:' + chartId + '->show;';
	await db.query(queryString);
}
export async function getEdgeChartToData(chartId: string): Promise<OutEdges> {
	const queryString = 'SELECT ->show.out as out from charts:' + chartId + ';';
	const result = await db.query<OutEdges[][]>(queryString);
	return result[0][0];
}
// Data Files
export async function storeCsvFile(csvSize: number, csvName: string, digest: string, salt: Uint8Array): Promise<DataFile> {
	// TODO use UPSERT with v2 of DB
	const result = await db.create<DataFile>('data', {
		id: new RecordId('data', digest),
		format: 'text/csv',
		tableName: csvName,
		size: csvSize,
		salt: salt,
	});
	return result[0];
}
export async function deleteDataRecord(dataId: string) {
	await db.delete(new StringRecordId('data:' + dataId));
}
export async function deleteAllDataToQuery(dataId: string) {
	const queryString = 'DELETE data:' + dataId + '<-import;DELETE data:' + dataId + '<-show;';
	await db.query(queryString);
}
// Queries
export async function linkQueryToData(dataId: string, queryId: string): Promise<InOutEdge> {
	const queryString = 'RELATE queries:' + queryId + '->import->data:' + dataId + ';';
	const result = await db.query<InOutEdge[][]>(queryString);
	return result[0][0];
}

export async function deleteQueryToDataImport(queryId: string) {
	const queryString = 'DELETE queries:' + queryId + '->import;';
	await db.query(queryString);
}
export async function getDataGraph(): Promise<GeneralResult[][]> {
	let result = await db.query<GeneralResult[][]>('SELECT * FROM data;SELECT * FROM queries;SELECT * FROM charts;SELECT * FROM import;SELECT * FROM show;');
	return result;
}
export async function deleteItAll() {
	await db.query('REMOVE DATABASE proto;');
}
export async function storeDfSqlFile(sqlStatement: string, queryId: string, salt: Uint8Array): Promise<Query> {
	// TODO use UPSERT with v2 of DB
	const result = await db.create<Query>('queries', {
		id: new RecordId('queries', queryId),
		format: 'df/sql',
		statement: sqlStatement,
		salt: salt,
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
export async function getEdgeChartToQuery(queryId: string): Promise<InEdges[]> {
	const queryString = 'SELECT <-show.in as in from queries:' + queryId + ';';
	const result = await db.query<InEdges[][]>(queryString);
	return result[0];
}
export async function deleteDfSqlFile(queryId: string) {
	await db.delete(new StringRecordId('queries:' + queryId));
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

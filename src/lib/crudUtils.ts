import {
	addQueryDataEdge,
	removeSpecificTargetEdges,
	updateQueryNode,
	removeSourceEdges,
	deleteNode,
	removeAllTargetEdges,
	updateEmptyQueryNode
} from '$lib/flowUtils';
import { digestString } from '$lib/signUtils';
import {
	deleteAllDataToQuery,
	deleteQueryToDataImport,
	deleteDataRecord,
	deleteDfSqlFile,
	linkQueryToData,
	storeDfSqlFile,
	updateDfSqlFile,
	type QueryData
} from '$lib/graphUtils';
import { unegister_table } from 'proto-query-engine';
import { getTables } from '$lib/dfSqlUtils';

export async function persistQuery(queryData: QueryData) {
	const digest = await digestString(queryData.statement);
	await storeDfSqlFile(queryData, digest).then((query) => updateEmptyQueryNode(query));
	(await getTables(queryData.statement)).forEach((tableId) =>
		linkQueryToData(tableId, digest).then((edge) => addQueryDataEdge(edge, 'import'))
	);
}
export async function updateQuery(queryData: QueryData, queryId: string) {
	await updateDfSqlFile(queryData, queryId).then((query) => updateQueryNode(query));
	// TODO this could be optimized as SQL and array reduce statements
	await deleteQueryToDataImport(queryId).then(() => removeSpecificTargetEdges(queryId, 'import'));
	(await getTables(queryData.statement)).forEach((tableId) =>
		linkQueryToData(tableId, queryId).then((edge) => addQueryDataEdge(edge, 'import'))
	);
}
export async function deleteQuery(queryId: string) {
	await deleteDfSqlFile(queryId)
		.then(() => deleteNode(queryId))
		.then(() => deleteQueryToDataImport(queryId))
		.then(() => removeAllTargetEdges(queryId));
}
export async function deleteDataRecordAndEdges(dataId: string, tableName: string) {
	await deleteDataRecord(dataId)
		.then(() => deleteNode(dataId))
		.then(() => deleteAllDataToQuery(dataId))
		.then(() => removeSourceEdges(dataId))
		.then(() => unegister_table(tableName));
}

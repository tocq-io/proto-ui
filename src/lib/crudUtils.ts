import { addQueryDataEdge, removeSpecificTargetEdges, updateQueryNode, removeSourceEdges, addChartNode, deleteNode, removeAllTargetEdges, updateEmptyQueryNode } from "$lib/flowUtils";
import { digestString } from "$lib/signUtils";
import { deleteAllChartToNode, deleteAllDataToQuery, deleteQueryToDataImport, deleteChartRecord, deleteDataRecord, deleteDfSqlFile, linkChartToNode, linkQueryToData, storeChart, storeDfSqlFile, updateDfSqlFile, getEdgeChartToQuery } from "$lib/graphUtils";
import type { ChartViewTable } from "$lib/storeUtils";
import { unegister_table } from "proto-query-engine";

export async function persistQuery(sql: string, tableIds: Set<string>) {
    if (tableIds.size === 0) return;
    const [digest, salt] = await digestString(sql);
    await storeDfSqlFile(sql, digest, salt).then((query) => updateEmptyQueryNode(query));
    for (const tableId of tableIds) {
        await linkQueryToData(tableId, digest).then((edge) => addQueryDataEdge(edge, 'import'));
    }
}
export async function persistChart(chartData: ChartViewTable, sourceNodeType: string) {
    const [digest, salt] = await digestString(chartData.tableId + chartData.type);
    await storeChart(digest, salt, chartData).then((chart) => addChartNode(chart.id.id.toString(), chartData));
    await linkChartToNode(digest, chartData.tableId, sourceNodeType).then((edge) => addQueryDataEdge(edge, 'show'));
}
export async function updateQuery(sql: string, tableIds: Set<string>, queryId: string) {
    if (tableIds.size === 0) return;
    await updateDfSqlFile(sql, queryId)
        .then((query) => getEdgeChartToQuery(query.id.id.toString())
        .then((chart) => updateQueryNode(query, chart)));
    // TODO this could be optimized as SQL and array reduce statements
    await deleteQueryToDataImport(queryId).then(() => removeSpecificTargetEdges(queryId, 'import'));
    for (const tableId of tableIds) {
        await linkQueryToData(tableId, queryId).then((edge) => addQueryDataEdge(edge, 'import'));
    }
}
export async function deleteChart(queryId: string) {
    await deleteChartRecord(queryId)
        .then(() => deleteNode(queryId))
        .then(() => deleteAllChartToNode(queryId))
        .then(() => removeSpecificTargetEdges(queryId, 'show'));
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
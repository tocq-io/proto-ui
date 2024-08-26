import { addQueryDataEdge, addQueryNode, removeSpecificTargetEdges, updateQueryNode, removeSourceEdges, addChartNode, deleteNode, removeAllTargetEdges } from "$lib/flowUtils";
import { digestString } from "$lib/signUtils";
import { deleteAllChartToNode, deleteAllDataToQuery, deleteQueryToDataImport, deleteChartRecord, deleteDataRecord, deleteDfSqlFile, linkChartToNode, linkQueryToData, storeChart, storeDfSqlFile, updateDfSqlFile, getEdgeChartToQuery } from "$lib/graphUtils";
import type { ChartViewTable } from "./storeUtils";
import { unegister_table } from "proto-query-engine";

export async function persistQuery(sql: string, tableIds: Set<string>) {
    const [digest, salt] = await digestString(sql);
    await storeDfSqlFile(sql, digest, salt).then((query) => addQueryNode(query));
    for (const tableId of tableIds) {
        await linkQueryToData(tableId, digest).then((edge) => addQueryDataEdge(edge, 'import'));
    }
    return digest;
}
export async function persistChart(chartData: ChartViewTable, sourceId: string, sourceNodeType: string) {
    const [digest, salt] = await digestString(sourceId + chartData.type);
    await storeChart(digest, salt, chartData).then((chart) => addChartNode(chart.id.id.toString(), chartData));
    await linkChartToNode(digest, sourceId, sourceNodeType).then((edge) => addQueryDataEdge(edge, 'show'));
    return digest;
}
export async function updateQuery(sql: string, tableIds: Set<string>, queryId: string) {
    await updateDfSqlFile(sql, queryId)
        .then((query) => getEdgeChartToQuery(query.id.id.toString())
        .then((chart) => updateQueryNode(query, chart)));
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
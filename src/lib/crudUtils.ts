import { addQueryDataEdge, addQueryNode, removeTargetEdges, updateQueryNode, removeSourceEdges, addChartNode, deleteNode, removeChartNodeEdges } from "$lib/flowUtils";
import { digestString } from "$lib/signUtils";
import { deleteAllChartToNode, deleteAllDataToQuery, deleteAllQueryToData, deleteChartRecord, deleteDataRecord, deleteDfSqlFile, linkChartToNode, linkQueryToData, storeChart, storeDfSqlFile, updateDfSqlFile } from "$lib/graphUtils";
import type { ChartLocalData } from "./storeUtils";
import { unegister_table } from "proto-query-engine";

export async function persistQuery(sql: string, tableIds: Set<string>) {
    const [digest, salt] = await digestString(sql);
    await storeDfSqlFile(sql, digest, salt).then((query) => addQueryNode(query));
    for (const tableId of tableIds) {
        await linkQueryToData(tableId, digest).then((edge) => addQueryDataEdge(edge, 'import'));
    }
    return digest;
}
export async function persistChart(chartData: ChartLocalData, sourceId: string, sourceNodeType: string) {
    const [digest, salt] = await digestString(sourceId + chartData.type + chartData.x + chartData.y + chartData.r);
    await storeChart(digest, salt, chartData).then((chart) => addChartNode(chart.id.id.toString(), chartData));
    await linkChartToNode(digest, sourceId, sourceNodeType).then((edge) => addQueryDataEdge(edge, 'show'));
    return digest;
}
export async function updateQuery(sql: string, tableIds: Set<string>, queryId: string) {
    await updateDfSqlFile(sql, queryId).then((query) => updateQueryNode(query));
    await deleteAllQueryToData(queryId).then(() => removeTargetEdges(queryId));
    for (const tableId of tableIds) {
        await linkQueryToData(tableId, queryId).then((edge) => addQueryDataEdge(edge, 'import'));
    }
}
export async function deleteChart(queryId: string) {
    await deleteChartRecord(queryId)
        .then(() => deleteNode(queryId))
        .then(() => deleteAllChartToNode(queryId))
        .then(() => removeTargetEdges(queryId));
}
export async function deleteQuery(queryId: string) {
    await deleteDfSqlFile(queryId)
        .then(() => deleteNode(queryId))
        .then(() => deleteAllQueryToData(queryId))
        .then(() => removeTargetEdges(queryId));
}
export async function deleteDataRecordAndEdges(dataId: string, tableName: string) {
    await deleteDataRecord(dataId)
        .then(() => deleteNode(dataId))
        .then(() => deleteAllDataToQuery(dataId))
        .then(() => removeSourceEdges(dataId))
        .then(() => unegister_table(tableName));
}
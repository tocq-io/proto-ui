import { addQueryDataEdge, addQueryNode, updateQueryDataEdges, updateQueryNode } from "$lib/flowUtils";
import { digestString } from "$lib/signUtils";
import { deleteQueryToData, linkQueryToData, storeDfSqlFile, updateDfSqlFile } from "$lib/graphUtils";

export async function persistQuery(sql: string, tableIds: Map<string, string>) {
    const queryId = await digestString(sql).then(
        (queryId) => storeDfSqlFile(sql, queryId).then(
            (query) => addQueryNode(query, 120, 160).then(() => {
                return queryId;
            })));
    for (const tableId of tableIds.keys()) {
        await linkQueryToData(tableId, queryId).then((edge) => addQueryDataEdge(edge));
    }
}
export async function updateQuery(sql: string, tableIds: Map<string, string>, queryId: string) {
    const result = await updateDfSqlFile(sql, queryId).then(
        (query) => updateQueryNode(query).then(
            () => updateQueryDataEdges(queryId, new Set(tableIds.keys())
            )));
    for (const tableId of result.addableTables) {
        let edge = await linkQueryToData(tableId, queryId);
        await addQueryDataEdge(edge);
    }
    for (const tableId of result.deletableTables) {
        await deleteQueryToData(tableId, queryId);
    }
}

import { addQueryDataEdge, addQueryNode, deleteQueryAndDataEdges, updateQueryDataEdges, updateQueryNode } from "$lib/flowUtils";
import { digestString } from "$lib/signUtils";
import { deleteAllQueryToData, deleteDfSqlFile, deleteQueryToData, linkQueryToData, storeDfSqlFile, updateDfSqlFile } from "$lib/graphUtils";

export async function persistQuery(sql: string, tableIds: Map<string, string>) {
    const queryId = await digestString(sql)
        .then((queryId) => storeDfSqlFile(sql, queryId)
            .then((query) => {
                addQueryNode(query, 120, 160);
                return queryId;
            }));
    for (const tableId of tableIds.keys()) {
        await linkQueryToData(tableId, queryId)
            .then((edge) => addQueryDataEdge(edge));
    }
}
export async function updateQuery(sql: string, tableIds: Map<string, string>, queryId: string) {
    const query = await updateDfSqlFile(sql, queryId);
    updateQueryNode(query);
    const edgeTables = new Set(tableIds.keys());
    const result = updateQueryDataEdges(queryId, edgeTables);
    for (const tableId of result.addableTables) {
        await linkQueryToData(tableId, queryId)
            .then((edge) => addQueryDataEdge(edge));
    }
    for (const tableId of result.deletableTables) {
        await deleteQueryToData(tableId, queryId);
    }
}
export async function deleteQuery(queryId: string) {
    await deleteDfSqlFile(queryId)
        .then(() => deleteAllQueryToData(queryId))
        .then(() => deleteQueryAndDataEdges(queryId));
}

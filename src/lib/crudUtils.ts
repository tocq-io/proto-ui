import { addQueryDataEdge, addQueryNode, deleteQueryNode as removeQueryNode, removeQueryDataEdges, updateQueryNode, deleteQueryNode, removeDataQueryEdges } from "$lib/flowUtils";
import { digestString } from "$lib/signUtils";
import { deleteAllDataToQuery, deleteAllQueryToData, deleteDataRecord, deleteDfSqlFile, linkQueryToData, storeDfSqlFile, updateDfSqlFile } from "$lib/graphUtils";

export async function persistQuery(sql: string, tableIds: Set<string>) {
    const [digest, salt] = await digestString(sql);
    await storeDfSqlFile(sql, digest, salt).then((query) => addQueryNode(query));
    for (const tableId of tableIds) {
        await linkQueryToData(tableId, digest).then((edge) => addQueryDataEdge(edge));
    }
    return digest;
}
export async function updateQuery(sql: string, tableIds: Set<string>, queryId: string) {
    await updateDfSqlFile(sql, queryId).then((query) => updateQueryNode(query));
    await deleteAllQueryToData(queryId).then(() => removeQueryDataEdges(queryId));
    for (const tableId of tableIds) {
        await linkQueryToData(tableId, queryId).then((edge) => addQueryDataEdge(edge));
    }
}
export async function deleteQuery(queryId: string) {
    await deleteDfSqlFile(queryId)
        .then(() => removeQueryNode(queryId))
        .then(() => deleteAllQueryToData(queryId))
        .then(() => removeQueryDataEdges(queryId));
}
export async function deleteDataRecordAndEdges(dataId: string) {
    await deleteDataRecord(dataId)
        .then(() => deleteQueryNode(dataId))
        .then(() => deleteAllDataToQuery(dataId))
        .then(() => removeDataQueryEdges(dataId));
}
import { initFlow } from "$lib/flowUtils";
import { digestString } from "$lib/signUtils";
import { deleteAllQueryToData, deleteDfSqlFile, linkQueryToData, storeDfSqlFile, updateDfSqlFile } from "$lib/graphUtils";
import { resetGraph } from "$lib/storeUtils";

export async function persistQuery(sql: string, tableIds: Set<string>) {
    const queryId = await digestString(sql);
    await storeDfSqlFile(sql, queryId);
    for (const tableId of tableIds) {
        await linkQueryToData(tableId, queryId);
    }
    resetGraph();
    await initFlow();
}
export async function updateQuery(sql: string, tableIds: Set<string>, queryId: string) {
    await updateDfSqlFile(sql, queryId);
    await deleteAllQueryToData(queryId);
    for (const tableId of tableIds) {
        await linkQueryToData(tableId, queryId);
    }
    resetGraph();
    await initFlow();
}
export async function deleteQuery(queryId: string) {
    await deleteDfSqlFile(queryId)
        .then(() => deleteAllQueryToData(queryId));
    resetGraph();
    await initFlow();
}

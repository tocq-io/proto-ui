import { initFlow } from "$lib/flowUtils";
import { digestString } from "$lib/signUtils";
import { deleteAllDataToQuery, deleteAllQueryToData, deleteDataRecord, deleteDfSqlFile, linkQueryToData, storeDfSqlFile, updateDfSqlFile } from "$lib/graphUtils";

export async function persistQuery(sql: string, tableIds: Set<string>) {
    const [digest, salt] = await digestString(sql);
    await storeDfSqlFile(sql, digest, salt);
    for (const tableId of tableIds) {
        await linkQueryToData(tableId, digest);
    }
    await initFlow();
    return digest;
}
export async function updateQuery(sql: string, tableIds: Set<string>, queryId: string) {
    await updateDfSqlFile(sql, queryId);
    await deleteAllQueryToData(queryId);
    for (const tableId of tableIds) {
        await linkQueryToData(tableId, queryId);
    }
    await initFlow();
}
export async function deleteQuery(queryId: string) {
    await deleteDfSqlFile(queryId)
        .then(() => deleteAllQueryToData(queryId));
    await initFlow();
}
export async function deleteDataRecordAndEdges(dataId: string) {
    await deleteDataRecord(dataId)
        .then(() => deleteAllDataToQuery(dataId));
    await initFlow();
}
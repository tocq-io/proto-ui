import { addQueryDataEdge, addQueryNode } from "$lib/flowUtils";
import { digestString } from "$lib/signUtils";
import { linkQueryToData, storeDfSqlFile } from "./graphUtils";

export async function persistQuery(sql: string, tableIds: string[]) {
    digestString(sql).then(
        (queryId) => storeDfSqlFile(sql, queryId).then(
            (query) => addQueryNode(query, 120, 160).then(() => {
                for (const tableId of tableIds) {
                    linkQueryToData(tableId, queryId).then(
                        (edge) => addQueryDataEdge(edge[0]));
                }
            })));
}

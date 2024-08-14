import { addQueryDataEdge, addQueryNode } from "$lib/flowUtils";
import { digestString } from "$lib/signUtils";
import type { Writable } from "svelte/store";
import { linkQueryToData, storeDfSqlFile } from "./graphUtils";
import type { Table } from "@apache-arrow/ts";
export interface PreviewTable {
    view: boolean;
    table: Table | undefined;
}
export interface SqlEdit {
    view: boolean;
    sql: string;
}
export async function persistQuery(sql: string, tableIds: string[], dataView: Writable<PreviewTable>, showEditView: Writable<SqlEdit>) {
    digestString(sql).then(
        (queryId) => storeDfSqlFile(sql, queryId).then(
            (query) => addQueryNode(query, dataView, tableIds, showEditView, 120, 160).then(() => {
                for (const tableId of tableIds) {
                    linkQueryToData(tableId, queryId).then(() => addQueryDataEdge(tableId, queryId));
                }
            })));
}

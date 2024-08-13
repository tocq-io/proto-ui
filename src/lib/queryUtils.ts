import { addQueryDataEdge, addQueryNode } from "$lib/flowUtils";
import { digestString } from "$lib/signUtils";
import { linkQueryToData, storeDfSqlFile } from "./graphUtils";

export async function writeSqlStatement(sql:string, tables: string[]) {
    digestString(sql).then(
        (id) => storeDfSqlFile(sql, id).then(
            (tf) => linkQueryToData(tables[0], id).then(
            () => addQueryNode(tf, 120, 160).then(
            () => addQueryDataEdge(tables[0], id))
    )));    
}
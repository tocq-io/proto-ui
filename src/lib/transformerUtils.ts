import { addTfDataEdge, addTransformerNode } from "$lib/flowUtils";
import { digestString } from "$lib/signUtils";
import { importDataToTf, storeDfSqlFile } from "./graphUtils";

export async function writeSqlStatement(sql:string, tables: string[]) {
    digestString(sql).then(
        (id) => storeDfSqlFile(sql, id).then(
            (tf) => importDataToTf(tables[0], id).then(
            () => addTransformerNode(tf, 120, 160).then(
            () => addTfDataEdge(tables[0], id))
    )));    
}
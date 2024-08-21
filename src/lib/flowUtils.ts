import { type Edge } from '@xyflow/svelte';
import { getDataGraph, type DataFile, type Query, type InOutEdge } from '$lib/graphUtils';
import { type DataFileNode, type DataFileData, nodes, type QueryNode, type QueryData, edges, resetGraph, results } from '$lib/storeUtils';
import { has_table, register_csv, run_sql } from 'proto-query-engine';
import { tableFromIPC } from '@apache-arrow/ts';
export function addDataNode(df: DataFile, shiftX: number = 0, shiftY: number = 0) {
    let fileData = {} as DataFileNode;
    fileData.type = 'dataNode';
    fileData.id = df.id.id.toString();
    fileData.deletable = false;
    fileData.connectable = false;
    fileData.position = { x: 24 + shiftX, y: 24 + shiftY };
    fileData.style = 'border: 1px solid #777; padding: 10px;';
    fileData.data = {
        name: df.fileName,
        size: df.size,
        format: df.format
    } as DataFileData;
    nodes.update((nodeArr) => {
        nodeArr.push(fileData);
        return nodeArr;
    });
    has_table(fileData.data.name)
        .then((hasTable) => {
            if (!hasTable) {
                register_csv(fileData.id + '.csv', fileData.data.name);
            }
        });
}
export function addQueryNode(query: Query, shiftX: number = 0, shiftY: number = 0) {
    let queryData = {} as QueryNode;
    queryData.type = 'queryNode';
    queryData.id = query.id.id.toString();
    queryData.deletable = false;
    queryData.connectable = false;
    queryData.position = { x: 24 + shiftX, y: 24 + shiftY };
    queryData.style = 'border: 1px solid #777; padding: 10px; background: rgba(255, 255, 255, 0.65);';
    queryData.data = {
        sql: query.statement,
        format: query.format
    } as QueryData;
    nodes.update((nodeArr) => {
        nodeArr.push(queryData);
        return nodeArr;
    });
    run_sql(queryData.data.sql).then((ipcResult) => {
        const table = tableFromIPC(ipcResult);
        results.update((rslt) => {
            rslt.set(queryData.id, table);
            return rslt;
        });
    });
}
export function addQueryDataEdge(edge: InOutEdge) {
    let queryDataEdge = {} as Edge;
    //data
    const from = edge.out.id.toString();
    queryDataEdge.source = from;
    //queries
    const to = edge.in.id.toString();
    queryDataEdge.target = to;
    queryDataEdge.deletable = false;
    queryDataEdge.selectable = false;
    queryDataEdge.id = 'e' + from + '-' + to;
    queryDataEdge.data = {
        label: 'loads'
    };
    queryDataEdge.type = 'queryDataEdge'
    edges.update((edgeArr) => {
        edgeArr.push(queryDataEdge);
        return edgeArr;
    });
}
export async function initFlow() {
    resetGraph();
    getDataGraph().then(async (data) => {
        let countData = 0;
        let countQuery = 0;
        for (const datum of data) {
            for (const entry of datum) {
                switch (entry.id.tb) {
                    case 'data':
                        addDataNode(<DataFile>entry, countData++ * 480, 0);
                        break;
                    case 'queries':
                        addQueryNode(<Query>entry, countQuery++ * 640, 160);
                        break;
                    case 'import':
                        addQueryDataEdge(<InOutEdge>entry);
                        break;
                }
            }
        }
    });
}

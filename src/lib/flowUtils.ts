import { type Edge, type Node } from '@xyflow/svelte';
import { getDataGraph, type DataFile, type Query, type InOutEdge } from '$lib/graphUtils';
import { type DataFileNode, type DataFileData, nodes, type QueryNode, type QueryData, edges, resetGraph } from '$lib/storeUtils';
import { register_csv } from 'proto-query-engine';
export async function addDataNode(df: DataFile, shiftX: number = 0, shiftY: number = 0) {
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
    await register_csv(fileData.id + '.csv', fileData.data.name);
}
export async function addQueryNode(query: Query, shiftX: number = 0, shiftY: number = 0) {
    let queryData = {} as QueryNode;
    queryData.type = 'queryNode';
    queryData.id = query.id.id.toString();
    queryData.deletable = false;
    queryData.connectable = false;
    queryData.position = { x: 24 + shiftX, y: 36 + shiftY };
    queryData.style = 'border: 1px solid #777; padding: 10px; background: rgba(255, 255, 255, 0.65);';
    queryData.data = {
        sql: query.statement,
        format: query.format
    } as QueryData;
    nodes.update((nodeArr) => {
        nodeArr.push(queryData);
        return nodeArr;
    });
}
export function updateQueryNode(query: Query) {
    nodes.update((nodeArr) => {
        for (const node of nodeArr) {
            if (node.id === query.id.id.toString()) {
                let dt = node.data;
                dt.sql = query.statement;
                node.data = { ...dt };
                break;
            }
        }
        return nodeArr;
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
export function removeQueryDataEdges(queryId: string) {
    edges.update((edgeArr) => {
        return edgeArr.reduce((p: Edge[], c: Edge) => (c.target !== queryId && p.push(c), p), []);
    });
}
export function removeDataQueryEdges(dataId: string) {
    edges.update((edgeArr) => {
        return edgeArr.reduce((p: Edge[], c: Edge) => (c.source !== dataId && p.push(c), p), []);
    });
}
export function deleteQueryNode(queryId: string) {
    nodes.update((nodesArr) => {
        return nodesArr.reduce((p: Node[], c: Node) => (c.id !== queryId && p.push(c), p), []);
    })
}
export function deleteDataNode(dataId: string) {
    nodes.update((nodesArr) => {
        return nodesArr.reduce((p: Node[], c: Node) => (c.id !== dataId && p.push(c), p), []);
    })
}
export async function initFlow() {
    resetGraph();
    let countData = 0;
    let countQuery = 0;
    (await getDataGraph()).forEach(async (data) => {
        for (const entry of data) {
            switch (entry.id.tb) {
                case 'data':
                    await addDataNode(<DataFile>entry, countData++ * 480, 0);
                    break;
                case 'queries':
                    await addQueryNode(<Query>entry, countQuery++ * 640, 160);
                    break;
                case 'import':
                    addQueryDataEdge(<InOutEdge>entry);
                    break;
            }
        }
    });
}

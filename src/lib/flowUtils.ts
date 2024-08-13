import { type Edge, type Node } from '@xyflow/svelte';
import { writable, type Writable } from 'svelte/store';
import type { DataFile, Query } from '$lib/graphUtils';
import type { PreviewTable, SqlEdit } from '$lib/queryUtils';
export const nodes = writable<Node[]>([]);
export const edges = writable<Edge[]>([]);
export async function addDataNode(df: DataFile, key: string, dataView: Writable<PreviewTable>, shiftX: number = 0, shiftY: number = 0): Promise<void> {
    let data = {} as Node;
    data.type = 'dataNode',
        data.id = key;
    data.position = { x: 24 + shiftX, y: 24 + shiftY };
    data.style = 'border: 1px solid #777; padding: 10px;',
        data.data = {
            name: df.fileName,
            size: df.size,
            schema: df.schema,
            format: df.format,
            view: dataView
        };
    console.log(data);
    nodes.update((nodeArr) => {
        nodeArr.push(data);
        return nodeArr;
    });
}
export async function addQueryNode(query: Query, dataView: Writable<PreviewTable>, tableIds: string[], sqlEditControl: Writable<SqlEdit>, shiftX: number = 0, shiftY: number = 0): Promise<void> {
    console.log(query);
    let queryData = {} as Node;
    queryData.type = 'queryNode';
    queryData.id = query.id.id.toString();
    queryData.position = { x: 24 + shiftX, y: 24 + shiftY };
    queryData.style = 'border: 1px solid #777; padding: 10px;',
        queryData.data = {
            sql: query.statement,
            format: query.format,
            tableIds: tableIds,
            sqlEditControl: sqlEditControl,
            view: dataView
        };
    console.log(queryData);
    nodes.update((nodeArr) => {
        nodeArr.push(queryData);
        return nodeArr;
    });
}
export async function addQueryDataEdge(from: string, to: string): Promise<void> {
    let queryDataEdge = {} as Edge;
    queryDataEdge.source = from;
    queryDataEdge.target = to;
    queryDataEdge.id = 'e' + from + '-' + to;
    edges.update((edgeArr) => {
        edgeArr.push(queryDataEdge);
        return edgeArr;
    });
}
export async function addTestNode(key: string, labelName: string, shift: number = 0): Promise<void> {
    let testData = {} as Node;
    testData.id = key;
    testData.position = { x: 24 + shift, y: 24 + shift };
    testData.data = { label: labelName };
    nodes.update((nodeArr) => {
        nodeArr.push(testData);
        return nodeArr;
    });
}
export async function addTestEdge(from: string, to: string): Promise<void> {
    let testData = {} as Edge;
    testData.source = from;
    testData.target = to;
    testData.id = 'e' + from + '-' + to;
    edges.update((edgeArr) => {
        edgeArr.push(testData);
        return edgeArr;
    });
}
import { type Edge, type Node, type NodeProps } from '@xyflow/svelte';
import { writable, type Writable } from 'svelte/store';
import type { DataFile, Query } from '$lib/graphUtils';
import type { PreviewTable, SqlEdit } from '$lib/queryUtils';
type DataFileData = {
    name: string;
    size: number;
    schema: string[];
    format: string;
    dataView: Writable<PreviewTable>;
};
export type DataFileProps = NodeProps &{
    data: DataFileData;
};
export type DataFileNode = Node & {
    data: DataFileData;
};
type QueryData = {
    sql: string;
    tableIds: string[];
    format: string;
    dataView: Writable<PreviewTable>;
    editView: Writable<SqlEdit>;
};
export type QueryProps = NodeProps & {
    data: QueryData;
};
export type QueryNode = Node & {
    data: QueryData;
};
export const nodes = writable<Node[]>([]);
export const edges = writable<Edge[]>([]);
export async function addDataNode(df: DataFile, key: string, dataView: Writable<PreviewTable>, shiftX: number = 0, shiftY: number = 0): Promise<void> {
    let data = {} as DataFileNode;
    data.type = 'dataNode';
    data.id = key;
    data.position = { x: 24 + shiftX, y: 24 + shiftY };
    data.style = 'border: 1px solid #777; padding: 10px;';
    data.data = {
        name: df.fileName,
        size: df.size,
        schema: df.schema,
        format: df.format,
        dataView: dataView
    } as DataFileData;
    console.log(data);
    nodes.update((nodeArr) => {
        nodeArr.push(data);
        return nodeArr;
    });
}
export async function addQueryNode(query: Query, dataView: Writable<PreviewTable>, tableIds: string[], editView: Writable<SqlEdit>, shiftX: number = 0, shiftY: number = 0): Promise<void> {
    console.log(query);
    let queryData = {} as QueryNode;
    queryData.type = 'queryNode';
    queryData.id = query.id.id.toString();
    queryData.position = { x: 24 + shiftX, y: 24 + shiftY };
    queryData.style = 'border: 1px solid #777; padding: 10px;';
    queryData.data = {
        sql: query.statement,
        format: query.format,
        tableIds: tableIds,
        editView: editView,
        dataView: dataView
    } as QueryData;
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
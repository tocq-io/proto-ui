import type { Table } from '@apache-arrow/ts';
import { type NodeProps, type Edge, type Node } from '@xyflow/svelte';
import { type Writable, writable } from 'svelte/store';

///// TYPES
export type DataFileData = {
    name: string;
    size: number;
    schema: string[];
    format: string;
};
export type DataFileProps = NodeProps & {
    data: DataFileData;
};
export type DataFileNode = Node & {
    data: DataFileData;
};
export type QueryData = {
    sql: string;
    format: string;
    edgeTables: Set<string>;
    initPhase: boolean;
};
export type QueryProps = NodeProps & {
    data: QueryData;
};
export type QueryNode = Node & {
    data: QueryData;
};
export type PreviewTable = {
    view: boolean;
    table: Table | undefined;
};
type SqlEdit = {
    view: boolean;
    done: boolean;
    sql: string;
    queryId: string;
};
///// SVELTE STORES
export let previewTable: Writable<PreviewTable> = writable({
    view: false,
    table: undefined
});
export let sqlEditControl: Writable<SqlEdit> = writable({
    view: false,
    done: false,
    sql: '',
    queryId: ''
});
export let showDataUpload = writable(false);
export const nodes = writable<Node[]>([]);
export const edges = writable<Edge[]>([]);
///// HELPER FUNCTIONS
export function isDataFileNode(node: Node): node is DataFileNode {
    return node.data.name !== undefined && node.data.schema !== undefined;
}
export function resetGraph(){
    nodes.set([]);
    edges.set([]);
}
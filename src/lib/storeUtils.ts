import type { Table } from '@apache-arrow/ts';
import { type NodeProps, type Edge, type Node } from '@xyflow/svelte';
import type { ChartTypeRegistry } from 'chart.js';
import { type Writable, writable } from 'svelte/store';
///// CONSTANTS
export const DATA_NODE_TYPE = 'dataNode';
export const QUERY_NODE_TYPE = 'queryNode';
export const DEFAULT_CHART_TYPE = 'bar';
///// FLOW TYPES
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
//// DATA VIEW TYPES
type PreviewTable = {
    view: boolean;
    table: Table | undefined;
};
export type ChartTableData = {
    id: string;
    name: string;
    x?: string,
    y?: string,
    r?: string,
    table?: Table;
};
export type ChartLocalData = {
    type: keyof ChartTypeRegistry;
    data: ChartTableData[];
};
type SqlEdit = {
    view: boolean;
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
    sql: '',
    queryId: ''
});
export let showDataUpload = writable(false);
export let showChartEditor = writable(false);
export const nodes = writable<Node[]>([]);
export const edges = writable<Edge[]>([]);
///// HELPER FUNCTIONS
export function resetGraph(){
    nodes.set([]);
    edges.set([]);
}

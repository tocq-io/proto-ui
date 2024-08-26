import type { Table } from '@apache-arrow/ts';
import { type NodeProps, type Edge, type Node } from '@xyflow/svelte';
import { type Writable, writable } from 'svelte/store';
///// CONSTANTS
export const DATA_NODE_TYPE = 'dataNode';
export const QUERY_NODE_TYPE = 'queryNode';
export const CHART_NODE_TYPE = 'chartNode';
// export const BAR_CHART_TYPE = 'bar';
// export const LINE_CHART_TYPE = 'line';
// export const BUBBLE_CHART_TYPE = 'bubble';
export enum CHART_TYPE {
    Bar = "bar",
    Line = "line",
    Bubble = "bubble",
  }
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
export type ChartData = {
    chartData: Writable<ChartViewTable>;
};
export type ChartProps = NodeProps & {
    data: ChartData;
};
export type ChartNode = Node & {
    data: ChartData;
};
//// DATA VIEW TYPES
type PreviewTable = {
    view: boolean;
    tableId: string | undefined;
};

export type ChartViewTable = {
    type: string;
    tableId?: string;
};
type SqlEdit = {
    view: boolean;
    sql: string;
    queryId: string;
};
///// SVELTE STORES
export let previewTable: Writable<PreviewTable> = writable({
    view: false,
    tableId: undefined
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
export const tables = writable<Map<string, Table>>(new Map());
///// HELPER FUNCTIONS
export function resetGraph(){
    nodes.set([]);
    edges.set([]);
}

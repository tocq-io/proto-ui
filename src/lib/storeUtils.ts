import { type NodeProps, type Edge, type Node } from '@xyflow/svelte';
import type { FrameColor } from 'flowbite-svelte/Frame.svelte';
import { type Writable, writable } from 'svelte/store';
import type { DataFile, QueryData } from './graphUtils';
///// CONSTANTS
export const DATA_NODE_TYPE = 'dataNode';
export const QUERY_NODE_TYPE = 'queryNode';
///// FLOW TYPES
export type DataFileProps = NodeProps & {
    data: Writable<DataFile>;
};
export type QueryProps = NodeProps & {
    data: Writable<QueryData>;
};
//// DATA VIEW TYPES
export type ErrorView = {
    color: FrameColor;
    visibility: string;
    msg: string;
};
///// SVELTE STORES
export let errorView: Writable<ErrorView> = writable({
    color: 'red',
    visibility: 'hidden',
    msg: '...'
});
export let showDataUpload = writable(false);
export const nodes = writable<Node[]>([]);
export const edges = writable<Edge[]>([]);
///// HELPER FUNCTIONS
export function resetGraph(){
    nodes.set([]);
    edges.set([]);
}

import { type NodeProps, type Edge, type Node } from '@xyflow/svelte';
import type { FrameColor } from 'flowbite-svelte/Frame.svelte';
import { type Writable, writable } from 'svelte/store';
import type { DataFile, QueryData } from '$lib/graphUtils';
///// CONSTANTS
export const DATA_NODE_TYPE = 'dataNode';
export const QUERY_NODE_TYPE = 'queryNode';
export const DEFAULT_CHART_CFG = `{
	type: 'bar',
	data: {
		labels: $table.toArray().map((row) => row[$table.schema.fields[0].name]),
		datasets: $table.schema.fields.slice(1).map((s) => {
			return {
				label: s.name,
				data: $table.toArray().map((row) => row[s.name])
			};
		})
	}
}`;
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
export const errorView: Writable<ErrorView> = writable({
	color: 'red',
	visibility: 'hidden',
	msg: '...'
});
export const showDataUpload = writable(false);
export const nodes = writable<Node[]>([]);
export const edges = writable<Edge[]>([]);
///// HELPER FUNCTIONS
export function resetGraph() {
	nodes.set([]);
	edges.set([]);
}

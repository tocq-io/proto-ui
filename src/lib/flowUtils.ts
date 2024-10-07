import { type Edge, type Node } from '@xyflow/svelte';
import {
	getDataGraph,
	type QueryRecord,
	type InOutEdge,
	type DataFileRecord,
	type NodePosition
} from '$lib/graphUtils';
import {
	nodes,
	edges,
	resetGraph,
	DATA_NODE_TYPE,
	QUERY_NODE_TYPE,
	DEFAULT_CHART_CFG
} from '$lib/storeUtils';
import { writable } from 'svelte/store';
import { registerArrowTable } from '$lib/dfSqlUtils';

const nodeStyle =
	'border: 1px solid #777; border-radius: 7px; padding: 10px; background: rgba(255, 255, 255, 0.65);';

function updateNodeStore(id: string, type: string, data: any, position: NodePosition) {
	const node = {} as Node;
	node.type = type;
	node.id = id;
	node.deletable = false;
	node.connectable = false;
	node.position = position;
	node.style = nodeStyle;
	node.data = data;
	nodes.update((nodeArr) => {
		nodeArr.push(node);
		return nodeArr;
	});
}

export async function addDataNode(df: DataFileRecord) {
	const dataId = df.id.id.toString();
	await registerArrowTable(dataId, df.tableName);
	const data = writable({
		tableName: df.tableName,
		size: df.size,
		format: df.format,
		nodeView: df.nodeView,
		position: df.position
	});
	updateNodeStore(dataId, DATA_NODE_TYPE, data, df.position);
}
export async function addEmptyQueryNode() {
	const position = { x: 480, y: 50 };
	const data = writable({
		statement: '',
		format: 'df/sql',
		chartConfig: DEFAULT_CHART_CFG,
		nodeView: 2,
		position: position
	});
	updateNodeStore('empty_query', QUERY_NODE_TYPE, data, position);
}
export async function updateEmptyQueryNode(query: QueryRecord) {
	const queryId = query.id.id.toString();
	nodes.update((nodeArr) => {
		for (const node of nodeArr) {
			if (node.id === 'empty_query') {
				node.id = queryId;
				const dt = node.data;
				dt.sql = query.statement;
				node.data = { ...dt };
				break;
			}
		}
		return nodeArr;
	});
}
export async function addQueryNode(query: QueryRecord) {
	const queryId = query.id.id.toString();
	const data = writable({
		statement: query.statement,
		format: query.format,
		chartConfig: query.chartConfig,
		nodeView: query.nodeView,
		position: query.position
	});
	updateNodeStore(queryId, QUERY_NODE_TYPE, data, query.position);
}
export async function updateQueryNode(query: QueryRecord) {
	const queryId = query.id.id.toString();
	nodes.update((nodeArr) => {
		for (const node of nodeArr) {
			if (node.id === queryId) {
				const dt = node.data;
				dt.sql = query.statement;
				node.data = { ...dt };
				break;
			}
		}
		return nodeArr;
	});
}
export function addQueryDataEdge(edge: InOutEdge, label: string) {
	const queryDataEdge = {} as Edge;
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
		label: label
	};
	queryDataEdge.type = 'queryDataEdge';
	edges.update((edgeArr) => {
		edgeArr.push(queryDataEdge);
		return edgeArr;
	});
}
export function removeSpecificTargetEdges(targetId: string, label: string) {
	edges.update((edgeArr) => {
		return edgeArr.reduce(
			(p: Edge[], c: Edge) => (c.target !== targetId && c.label !== label && p.push(c), p),
			[]
		);
	});
}
export function removeAllTargetEdges(targetId: string) {
	edges.update((edgeArr) => {
		return edgeArr.reduce((p: Edge[], c: Edge) => (c.target !== targetId && p.push(c), p), []);
	});
}
export function removeSourceEdges(sourceId: string) {
	edges.update((edgeArr) => {
		return edgeArr.reduce((p: Edge[], c: Edge) => (c.source !== sourceId && p.push(c), p), []);
	});
}
export function deleteNode(nodeId: string) {
	nodes.update((nodesArr) => {
		return nodesArr.reduce((p: Node[], c: Node) => (c.id !== nodeId && p.push(c), p), []);
	});
}
export async function initFlow() {
	resetGraph();
	const allData = await getDataGraph();
	for (const data of allData) {
		for (const entry of data) {
			switch (entry.id.tb) {
				case 'data':
					await addDataNode(<DataFileRecord>entry);
					break;
				case 'queries':
					await addQueryNode(<QueryRecord>entry);
					break;
				case 'import':
					addQueryDataEdge(<InOutEdge>entry, 'import');
					break;
			}
		}
	}
}

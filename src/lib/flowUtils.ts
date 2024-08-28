import { type Edge, type Node } from '@xyflow/svelte';
import { getDataGraph, type DataFile, type Query, type InOutEdge, type Chart, getEdgeChartToData, type InEdges } from '$lib/graphUtils';
import { type DataFileNode, type DataFileData, nodes, type QueryNode, type QueryData, edges, resetGraph, DATA_NODE_TYPE, QUERY_NODE_TYPE, type ChartViewTable, type ChartNode, CHART_NODE_TYPE } from '$lib/storeUtils';
import { register_csv } from 'proto-query-engine';
import { writable } from 'svelte/store';
import { updateArrowTables } from '$lib/arrowSqlUtils';

const nodeStyle = 'border: 1px solid #777; border-radius: 7px; padding: 10px; background: rgba(255, 255, 255, 0.65);';

function updateNodeStore(node: Node, id: string, data: any, x: number = 0){
    node.id = id;
    node.deletable = false;
    node.connectable = false;
    node.position = { x: x, y: 0 };
    node.style = nodeStyle;
    node.data = data;
    nodes.update((nodeArr) => {
        nodeArr.push(node);
        return nodeArr;
    });
}
export async function addDataNode(df: DataFile) {
    let fileNode = {} as DataFileNode;
    fileNode.type = DATA_NODE_TYPE;
    let data = {
        name: df.tableName,
        size: df.size,
        format: df.format
    } as DataFileData;
    let dataId = df.id.id.toString();
    updateNodeStore(fileNode, dataId, data);
    await register_csv(dataId + '.csv', df.tableName);
    await updateArrowTables('SELECT * FROM ' + df.tableName, dataId);
}
export async function addEmptyQueryNode() {
    let queryNode = {} as QueryNode;
    queryNode.type = QUERY_NODE_TYPE;
    let data = {
        sql: '',
        format: 'df/sql'
    } as QueryData;
    updateNodeStore(queryNode, 'empty_query', data, 720);
}
export async function updateEmptyQueryNode(query: Query) {
    const queryId = query.id.id.toString();
    await updateArrowTables(query.statement, queryId);
    nodes.update((nodeArr) => {
        for (const node of nodeArr) {
            if (node.id === 'empty_query') {
                node.id = queryId;
                let dt = node.data;
                dt.sql = query.statement;
                node.data = { ...dt };
                break;
            }
        }
        return nodeArr;
    });
}
export async function addQueryNode(query: Query) {
    let queryNode = {} as QueryNode;
    queryNode.type = QUERY_NODE_TYPE;
    let data = {
        sql: query.statement,
        format: query.format
    } as QueryData;
    const queryId = query.id.id.toString();
    updateNodeStore(queryNode, queryId, data);
    await updateArrowTables(query.statement, queryId);
}
export async function addChartNode(id: string, localChartData: ChartViewTable) {
    let chartNode = {} as ChartNode;
    chartNode.type = CHART_NODE_TYPE;
    let data = { chartData: writable(localChartData) }
    updateNodeStore(chartNode, id, data);
}
export async function initChartNode(chart: Chart) {
    let dataEdge = await getEdgeChartToData(chart.id.id.toString());
    let chartLocalData: ChartViewTable = {
        type: chart.type,
        tableId: dataEdge.out[0].id.toString(),
    };
    addChartNode(chart.id.id.toString(), chartLocalData);
}
export async function updateQueryNode(query: Query, charts: InEdges[]) {
    const queryId = query.id.id.toString();
    await updateArrowTables(query.statement, queryId);
    nodes.update((nodeArr) => {
        for (const node of nodeArr) {
            if (node.id === queryId) {
                let dt = node.data;
                dt.sql = query.statement;
                node.data = { ...dt };
            } else if (node.type === CHART_NODE_TYPE) {
                for (const chart of charts) {
                    for (const inEdge of chart.in) {
                        if (inEdge.tb === 'charts' && inEdge.id.toString() === node.id) {
                            const chartNode = <ChartNode>node;
                            chartNode.data.chartData.update((chD) => {
                                chD.tableId = queryId;
                                return chD;
                            });
                        }
                    }
                }
            }
        }
        return nodeArr;
    });
}
export function addQueryDataEdge(edge: InOutEdge, label: string) {
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
        label: label
    };
    queryDataEdge.type = 'queryDataEdge'
    edges.update((edgeArr) => {
        edgeArr.push(queryDataEdge);
        return edgeArr;
    });
}
export function removeSpecificTargetEdges(targetId: string, label: string) {
    edges.update((edgeArr) => {
        return edgeArr.reduce((p: Edge[], c: Edge) => (c.target !== targetId && c.label !== label && p.push(c), p), []);
    });
}
export function removeAllTargetEdges(targetId: string,) {
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
    })
}
export async function initFlow() {
    resetGraph();
    let allData = await getDataGraph();
    for (const data of allData) {
        for (const entry of data) {
            switch (entry.id.tb) {
                case 'data':
                    await addDataNode(<DataFile>entry);
                    break;
                case 'queries':
                    await addQueryNode(<Query>entry);
                    break;
                case 'charts':
                    await initChartNode(<Chart>entry);
                    break;
                case 'import':
                    addQueryDataEdge(<InOutEdge>entry, 'import');
                    break;
                case 'show':
                    addQueryDataEdge(<InOutEdge>entry, 'show');
                    break;
            }
        }
    }
}

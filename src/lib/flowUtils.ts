import { type Edge, type Node } from '@xyflow/svelte';
import { getDataGraph, type DataFile, type Query, type InOutEdge, type Chart, getEdgeChartToData, type InEdges } from '$lib/graphUtils';
import { type DataFileNode, type DataFileData, nodes, type QueryNode, type QueryData, edges, resetGraph, DATA_NODE_TYPE, QUERY_NODE_TYPE, type ChartViewTable, type ChartNode, CHART_NODE_TYPE, tables } from '$lib/storeUtils';
import { register_csv, run_sql } from 'proto-query-engine';
import { writable, type Writable } from 'svelte/store';
import { tableFromIPC } from '@apache-arrow/ts';

const nodeStyle = 'border: 1px solid #777; border-radius: 7px; padding: 10px; background: rgba(255, 255, 255, 0.65);';

export async function addDataNode(df: DataFile, itemNo: number = 0) {
    let fileData = {} as DataFileNode;
    fileData.type = DATA_NODE_TYPE;
    fileData.id = df.id.id.toString();
    fileData.deletable = false;
    fileData.connectable = false;
    fileData.position = { x: 24 + itemNo * 160, y: 24 };
    fileData.style = nodeStyle;
    fileData.data = {
        name: df.tableName,
        size: df.size,
        format: df.format
    } as DataFileData;
    nodes.update((nodeArr) => {
        nodeArr.push(fileData);
        return nodeArr;
    });
    await register_csv(df.id.id.toString() + '.csv', df.tableName);
    await run_sql('SELECT * FROM ' + df.tableName).then((reslt) => {
        tables.update((tblMp) => {
            tblMp.set(df.id.id.toString(), tableFromIPC(reslt));
            return tblMp;
        });
    });
}
export async function addQueryNode(query: Query, itemNo: number = 0) {
    let queryData = {} as QueryNode;
    queryData.type = QUERY_NODE_TYPE;
    queryData.id = query.id.id.toString();
    queryData.deletable = false;
    queryData.connectable = false;
    queryData.position = { x: 124 + itemNo * 640, y: 176 };
    queryData.style = nodeStyle;
    queryData.data = {
        sql: query.statement,
        format: query.format
    } as QueryData;
    nodes.update((nodeArr) => {
        nodeArr.push(queryData);
        return nodeArr;
    });
    await run_sql(query.statement).then((reslt) => {
        tables.update((tblMp) => {
            tblMp.set(query.id.id.toString(), tableFromIPC(reslt));
            return tblMp;
        })
    });
}
export async function addChartNode(id: string, localChartData: ChartViewTable, itemNo: number = 0) {
    let chartData = {} as ChartNode;
    chartData.type = CHART_NODE_TYPE;
    chartData.id = id;
    chartData.deletable = false;
    chartData.connectable = false;
    chartData.position = { x: 24 + itemNo * 560, y: 356 };
    chartData.style = nodeStyle;
    chartData.data = { chartData: writable(localChartData) }
    nodes.update((nodeArr) => {
        nodeArr.push(chartData);
        return nodeArr;
    });
}
export async function initChartNode(chart: Chart, itemNo: number = 0) {
    let dataEdge = await getEdgeChartToData(chart.id.id.toString());
    let chartLocalData: ChartViewTable = {
        type: chart.type,
        tableId: dataEdge.out[0].id.toString(),
    };
    await addChartNode(chart.id.id.toString(), chartLocalData, itemNo);
}
export async function updateQueryNode(query: Query, charts: InEdges[]) {
    const queryId = query.id.id.toString();
    await run_sql(query.statement).then((reslt) => {
        tables.update((tblMp) => {
            tblMp.set(queryId, tableFromIPC(reslt));
            return tblMp;
        })
    });
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
    let countData = 0;
    let countQuery = 0;
    let countChart = 0;
    let allData = await getDataGraph();
    for (const data of allData) {
        for (const entry of data) {
            switch (entry.id.tb) {
                case 'data':
                    await addDataNode(<DataFile>entry, countData++);
                    break;
                case 'queries':
                    await addQueryNode(<Query>entry, countQuery++);
                    break;
                case 'charts':
                    await initChartNode(<Chart>entry, countChart++);
                    break;
                case 'import':
                    await addQueryDataEdge(<InOutEdge>entry, 'import');
                    break;
                case 'show':
                    await addQueryDataEdge(<InOutEdge>entry, 'show');
                    break;
            }
        }
    }
}

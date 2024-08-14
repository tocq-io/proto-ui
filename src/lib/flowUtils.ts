import { type Edge } from '@xyflow/svelte';
import { getDataGraph, type DataFile, type Query, type QueryDataEdge } from '$lib/graphUtils';
import { type DataFileNode, type DataFileData, nodes, type QueryNode, type QueryData, edges } from '$lib/storeUtils';
export async function addDataNode(df: DataFile, shiftX: number = 0, shiftY: number = 0): Promise<void> {
    let data = {} as DataFileNode;
    data.type = 'dataNode';
    data.id = df.id.id.toString();
    data.position = { x: 24 + shiftX, y: 24 + shiftY };
    data.style = 'border: 1px solid #777; padding: 10px;';
    data.data = {
        name: df.fileName,
        size: df.size,
        schema: df.schema,
        format: df.format
    } as DataFileData;
    nodes.update((nodeArr) => {
        nodeArr.push(data);
        return nodeArr;
    });
}
export async function addQueryNode(query: Query, shiftX: number = 0, shiftY: number = 0): Promise<void> {
    console.log(query);
    let queryData = {} as QueryNode;
    queryData.type = 'queryNode';
    queryData.id = query.id.id.toString();
    queryData.position = { x: 24 + shiftX, y: 24 + shiftY };
    queryData.style = 'border: 1px solid #777; padding: 10px;';
    queryData.data = {
        sql: query.statement,
        format: query.format
    } as QueryData;
    nodes.update((nodeArr) => {
        nodeArr.push(queryData);
        return nodeArr;
    });
}
export async function updateQueryNode(query: Query): Promise<void> {
    nodes.update((nodeArr) => {
        for (const node of nodeArr) {
            if (node.id === query.id.id.toString()){
                let dt = node.data;
                dt.sql = query.statement;
                node.data = {...dt};
            }
        }
        return nodeArr;
    });
}
export async function addQueryDataEdge(edge: QueryDataEdge): Promise<void> {
    let queryDataEdge = {} as Edge;
    //data
    const from = edge.out.id.toString();
    queryDataEdge.source = from;
    //queries
    const to = edge.in.id.toString();
    queryDataEdge.target = to;
    queryDataEdge.id = 'e' + from + '-' + to;
    edges.update((edgeArr) => {
        edgeArr.push(queryDataEdge);
        return edgeArr;
    });
}
export function updateQueryDataEdges(queryId: string, dataIds: Set<string>) {
    let addableTables: Set<string> = dataIds;
    let deletableTables: Set<string> = new Set();
    edges.update((edgeArr) => {
        let newArr: Edge[] = [];
        for (const edge of edgeArr){
            if (edge.target === queryId){
                if (addableTables.has(edge.source)){
                    newArr.push(edge);
                } else {
                    deletableTables.add(edge.source);
                }
                addableTables.delete(edge.source);
            } else {
                newArr.push(edge);
            }
        }
        return newArr;
    });
    return {addableTables, deletableTables};
}
export async function initFlow() {
    getDataGraph().then((data) => {
        let countData = 0;
        let countQuery = 0;
        for (const datum of data) {
            for (const entry of datum) {
                console.log(entry);
                switch (entry.id.tb) {
                    case 'data':
                        addDataNode(<DataFile>entry, countData++ * 360, 0);
                        break;
                    case 'queries':
                        addQueryNode(<Query>entry, countQuery++ * 240, 160);
                        break;
                    case 'import':
                        addQueryDataEdge(<QueryDataEdge>entry);
                        break;
                }
            }
        }
    });
}

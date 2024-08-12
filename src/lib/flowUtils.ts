import { type Edge, type Node } from '@xyflow/svelte';
import { writable } from 'svelte/store';
import type { DataFile, Transformer } from '$lib/graphUtils';
export const nodes = writable<Node[]>([]);
export const edges = writable<Edge[]>([]);
export async function addDataNode(df: DataFile, key: string, shiftX: number = 0, shiftY: number = 0): Promise<void> {
    let data = {} as Node;
    data.type = 'dataNode',
    data.id = key;
    data.position = { x: 24 + shiftX, y: 24 + shiftY };
    data.style = 'border: 1px solid #777; padding: 10px;',
    data.data = {
        name: df.fileName,
        size: df.size,
        schema: df.schema,
        format: df.format
    };
    console.log(data);
    nodes.update((nodeArr) => {
        nodeArr.push(data);
        return nodeArr;
    });
}
export async function addTransformerNode(tf: Transformer, shiftX: number = 0, shiftY: number = 0): Promise<void> {
    console.log(tf);
    let tfData = {} as Node;
    tfData.type = 'tfNode';
    tfData.id = tf.id.id.toString();
    tfData.position = { x: 24 + shiftX, y: 24 + shiftY };
    tfData.style = 'border: 1px solid #777; padding: 10px;',
    tfData.data = { 
        sql: tf.statement,
        format: tf.format
    };
    console.log(tfData);
    nodes.update((nodeArr) => {
        nodeArr.push(tfData);
        return nodeArr;
    });
}
export async function addTfDataEdge(from: string, to: string): Promise<void> {
    let tfDfEdge = {} as Edge;
    tfDfEdge.source = from;
    tfDfEdge.target = to;
    tfDfEdge.id = 'e' + from + '-' + to;
    edges.update((edgeArr) => {
        edgeArr.push(tfDfEdge);
        return edgeArr;
    });
}
export async function addTestNode(key: string, labelName: string, shift: number = 0): Promise<void> {
    let testData = {} as Node;
    testData.id = key;
    testData.position = { x: 24 + shift, y: 24 + shift };
    testData.data = { label: labelName };
    nodes.update((nodeArr) => {
        nodeArr.push(testData);
        return nodeArr;
    });
}
export async function addTestEdge(from: string, to: string): Promise<void> {
    let testData = {} as Edge;
    testData.source = from;
    testData.target = to;
    testData.id = 'e' + from + '-' + to;
    edges.update((edgeArr) => {
        edgeArr.push(testData);
        return edgeArr;
    });
}
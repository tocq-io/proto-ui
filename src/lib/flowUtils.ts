import { type Edge, type Node } from '@xyflow/svelte';
import { writable } from 'svelte/store';
export const nodes = writable<Node[]>([]);
export const edges = writable<Edge[]>([]);
export async function addCsvNode(id: string, labelName: string, size: number, shift: number = 0): Promise<void> {
    let csvData = {} as Node;
    csvData.type = 'csvNode',
    csvData.id = id;
    csvData.position = { x: 24 + shift, y: 24 + shift };
    csvData.style = 'border: 1px solid #777; padding: 10px;',
    csvData.data = {
        name: labelName,
        size: size
    };
    nodes.update((nodeArr) => {
        nodeArr.push(csvData);
        return nodeArr;
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
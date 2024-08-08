import { type Edge, type Node } from '@xyflow/svelte';
import { writable } from 'svelte/store';
export const nodesArray: Node[] = [];
export const edgesArray: Edge[] = [];
export const nodes = writable<Node[]>(nodesArray);
export const edges = writable<Edge[]>(edgesArray);
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
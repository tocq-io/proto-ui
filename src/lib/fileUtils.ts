import { digestFile } from '$lib/signUtils';
import { storeCsvFile } from '$lib/graphUtils';
import { type Edge, type Node } from '@xyflow/svelte';
import { writable } from 'svelte/store';
export let importDir: FileSystemDirectoryHandle;
export const nodesArray: Node[] = [];
export const edgesArray: Edge[] = [];
export const nodes = writable<Node[]>(nodesArray);
export const edges = writable<Edge[]>(edgesArray);
export async function getAvailableGb(): Promise<string> {
	const quota = (await navigator.storage.estimate()).quota;
	const usage = (await navigator.storage.estimate()).usage;
	return (
		((quota === undefined ? 0 : quota) - (usage === undefined ? 0 : usage)) /
		1000000000
	).toFixed(2);
}
export async function loadFileImportDir(): Promise<void> {
	return navigator.storage.getDirectory().then(
		(opfsRoot) => (opfsRoot.getDirectoryHandle('fileImport', { create: true })).then(
			(dir) => {
				importDir = dir;
				console.log(opfsRoot);
				console.log(dir);
			}
		)
	);
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
export async function writeFile(file: File): Promise<void> {
	const tableName = file.name.replace(/\.[^/.]+$/, '');
	return digestFile(file).then(
		(digestHex) => (importDir.getFileHandle(digestHex, { create: true })).then(
			(importFile) => (importFile.createWritable()).then(
				(writable) => (writable.write(file)).then(
					() => (writable.close()).then(
						() => (storeCsvFile(tableName, digestHex)).then(
							() => {
								addTestNode(digestHex, tableName);
								console.log(digestHex);
								console.log(importFile);
							}))))));
}

import { digestFile } from '$lib/signUtils';
import { storeCsvFile, getUserId } from '$lib/graphUtils';
import { type Node } from '@xyflow/svelte';
import { load_csv, run_sql } from 'proto-query-engine';
import { tableFromIPC } from '@apache-arrow/ts';
import { writable } from 'svelte/store';
export let importDir: FileSystemDirectoryHandle;
export const nodes = writable<Node[]>([]);
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
export async function addFileNode(key: string, labelName: string): Promise<void> {
	let fileData = {} as Node;
	fileData.id = key;
	fileData.position = { x: 24, y: 24 };
	fileData.data = { label: labelName };
	nodes.update((nodeArr) => {
		nodeArr.push(fileData);
		return nodeArr;
	});
}
export async function writeFile(file: File): Promise<void> {
	const tableName = file.name.replace(/\.[^/.]+$/, '');
	return getUserId().then(
		(userId) => (digestFile(file, userId)).then(
			(digestHex) => (importDir.getFileHandle(digestHex, { create: true })).then(
				(importFile) => (importFile.createWritable()).then(
					(writable) => (writable.write(file)).then(
						() => (writable.close()).then(
							() => (storeCsvFile(tableName, digestHex)).then(
								() => (addFileNode(digestHex, tableName)).then(
									// TODO remove the tests below
									() => (load_csv(digestHex, tableName)).then(
										() => run_sql('SELECT a, MIN(b) FROM test WHERE a <= b GROUP BY a LIMIT 100').then(
											(test_sql) => {
												const table = tableFromIPC(test_sql);
												console.log(userId);
												console.log(digestHex);
												console.log(importFile);
												console.log(table.toString());
											}))))))))));
}

import { digestFile } from '$lib/signUtils';
import { storeCsvFile } from '$lib/graphUtils';
import { addTestNode } from '$lib//flowUtils';
export let importDir: FileSystemDirectoryHandle;
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

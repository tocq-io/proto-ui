import { digestFile } from '$lib/signUtils';
import { storeDataFile, type DataFile } from '$lib/graphUtils';
import { addDataNode } from '$lib/flowUtils';
import { load_csv_bytes } from 'proto-query-engine/proto_query_engine';

export async function getAvailableGb(): Promise<string> {
	const quota = (await navigator.storage.estimate()).quota;
	const usage = (await navigator.storage.estimate()).usage;
	return (
		((quota === undefined ? 0 : quota) - (usage === undefined ? 0 : usage)) /
		1000000000
	).toFixed(2);
}
export async function getFileImportDir(): Promise<FileSystemDirectoryHandle> {
	return navigator.storage.getDirectory().then(
		(opfsRoot) => (opfsRoot.getDirectoryHandle('data', { create: true })));
}
export async function resetImportDir() {
	return navigator.storage.getDirectory().then(
		(opfsRoot) => (opfsRoot.removeEntry('data', { recursive: true })));
}
export async function writeCsvFile(file: File) {
	const tableName = file.name.replace(/\.[^/.]+$/, '');
	const fileUint8 = await file.arrayBuffer(); // encode as (utf-8) Uint8Array
	await digestFile(fileUint8)
		.then((digest) => load_csv_bytes(new Uint8Array(fileUint8), digest)
			.then(() => {
				let dataFile = {
					tableName: tableName,
					format: 'text/csv',
					size: file.size,
					nodeView: 0,
					chartType: 'bar'
				} as DataFile;
				storeDataFile(dataFile, digest)
					.then((fileData) => (addDataNode(fileData)));
			}));
}

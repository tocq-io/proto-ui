import { digestFile } from '$lib/signUtils';
import { storeDataFile, type DataFile } from '$lib/graphUtils';
import { addDataNode } from '$lib/flowUtils';
import { importCsvData, type CsvConfig } from './dfSqlUtils';

export async function getAvailableGb(): Promise<string> {
	const quota = (await navigator.storage.estimate()).quota;
	const usage = (await navigator.storage.estimate()).usage;
	return (
		((quota === undefined ? 0 : quota) - (usage === undefined ? 0 : usage)) /
		1000000000
	).toFixed(2);
}
export async function resetImportDir() {
	return navigator.storage.getDirectory().then(
		(opfsRoot) => (opfsRoot.removeEntry('data', { recursive: true })));
}
export async function writeCsvFile(file: File, csvConfig: CsvConfig) {
	const tableName = file.name.replace(/\.[^/.]+$/, '');
	const fileUint8 = await file.arrayBuffer(); // encode as (utf-8) Uint8Array
	await digestFile(fileUint8)
		.then((digest) => importCsvData(digest, fileUint8, csvConfig)
			.then(() => {
				let dataFile = {
					tableName: tableName,
					format: 'text/csv',
					size: file.size,
					nodeView: 0,
					chartType: 'bar',
					position: { x: 50, y: 50 }
				} as DataFile;
				storeDataFile(dataFile, digest)
					.then((fileData) => (addDataNode(fileData)));
			}));
}

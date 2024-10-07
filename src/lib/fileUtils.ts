import { digestFile } from '$lib/signUtils';
import { storeDataFile, type DataFile } from '$lib/graphUtils';
import { addDataNode } from '$lib/flowUtils';
import { importCsvData, type CsvConfig } from '$lib/dfSqlUtils';

export async function resetImportDir() {
	return navigator.storage
		.getDirectory()
		.then((opfsRoot) => opfsRoot.removeEntry('data', { recursive: true }));
}
export async function writeCsvFile(file: File, csvConfig: CsvConfig) {
	const tableName = file.name.replace(/\.[^/.]+$/, '');
	const fileArrayBuffer = await file.arrayBuffer(); // encode as (utf-8) Uint8Array
	await digestFile(fileArrayBuffer).then((digest) =>
		importCsvData(digest, fileArrayBuffer, csvConfig).then(() => {
			const dataFile = {
				tableName: tableName,
				format: 'text/csv',
				size: file.size,
				nodeView: 0,
				position: { x: 50, y: 50 }
			} as DataFile;
			storeDataFile(dataFile, digest).then((fileData) => addDataNode(fileData));
		})
	);
}

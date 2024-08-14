import { digestFile } from '$lib/signUtils';
import { storeCsvFile } from '$lib/graphUtils';
import { addDataNode } from '$lib/flowUtils';

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
		(opfsRoot) => (opfsRoot.getDirectoryHandle('fileImport', { create: true })));
}
async function getCsvHeader(file: File): Promise<string[]> {
	return new Promise<string[]>((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const text = reader.result;
			const firstLine = (<string>text)?.split('\n').shift();
			let header = firstLine?.split(',');
			console.log(header);
			resolve(header || []);
		}
		reader.onerror = reject;
		reader.readAsText(file, 'UTF-8');
	});
}
export async function writeCsvFile(importDir: FileSystemDirectoryHandle, file: File, tableName: string) {
	digestFile(file).then(
		(digestHex) => (importDir.getFileHandle(digestHex, { create: true })).then(
			(importFile) => (importFile.createWritable()).then(
				(writable) => (writable.write(file)).then(
					() => (writable.close()).then(
						() => (getCsvHeader(file)).then(
							(header) => (storeCsvFile(header, file.size, tableName, digestHex).then(
								(fileData) => (addDataNode(fileData).then(
									() => {
										console.log(digestHex);
										console.log(importFile);
									}))))))))));
}

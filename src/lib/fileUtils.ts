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
		(opfsRoot) => (opfsRoot.getDirectoryHandle('data', { create: true })));
}
export async function resetImportDir() {
	return navigator.storage.getDirectory().then(
		(opfsRoot) => (opfsRoot.removeEntry('data', { recursive: true })));
}
export async function writeCsvFile(importDir: FileSystemDirectoryHandle, file: File, tableName: string, shiftX: number) {
	await digestFile(file)
		.then(([digest, salt]) => (importDir.getFileHandle(digest + '.csv', { create: true }))
			.then((importFile) => (importFile.createWritable())
				.then((writable) => (writable.write(file))
					.then(() => (writable.close())
						.then(() => (storeCsvFile(file.size, tableName, digest, salt)
							.then((fileData) => (addDataNode(fileData, shiftX)))))))));
}

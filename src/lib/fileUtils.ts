import { digestFile } from '$lib/signUtils';
export async function getAvailableGb(): Promise<string> {
	const quota = (await navigator.storage.estimate()).quota;
	const usage = (await navigator.storage.estimate()).usage;
	return (
		((quota === undefined ? 0 : quota) - (usage === undefined ? 0 : usage)) /
		1000000000
	).toFixed(2);
}
export async function getFileImportDir(): Promise<FileSystemDirectoryHandle> {
	const opfsRoot = await navigator.storage.getDirectory();
	console.log(opfsRoot);
	const importDir = await opfsRoot.getDirectoryHandle('fileImport', { create: true });
	console.log(importDir);
	return importDir;
}
export async function writeFile(importDir: FileSystemDirectoryHandle, file: File, userId: string) {
	const importFile = await importDir.getFileHandle(file.name, { create: true });
	console.log(importFile);
	digestFile(file, userId).then((digestHex) => console.log(digestHex));
	//TODO: https://webkit.org/b/231706
	const writable = await importFile.createWritable();
	await writable.write(file);
	await writable.close();
}

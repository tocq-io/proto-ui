import { digestFile } from '$lib/signUtils';
import { storeCsvFile } from '$lib/graphUtils';
import { load_csv, run_sql } from 'proto-query-engine';
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
	const digestHex = await digestFile(file, userId);
	console.log(digestHex);
	const importFile = await importDir.getFileHandle(digestHex, { create: true });
	console.log(importFile);
	//TODO: https://webkit.org/b/231706
	const writable = await importFile.createWritable();
	await writable.write(file);
	await writable.close();
	storeCsvFile(file.name, digestHex);
	await load_csv(digestHex, 'test');
	console.log(await run_sql('SELECT a, MIN(b) FROM test WHERE a <= b GROUP BY a LIMIT 100'));
	return { key: digestHex, value: file.name };
}

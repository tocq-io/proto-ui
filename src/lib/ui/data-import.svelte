<script lang="ts">
	import init from 'proto-query-engine';
	import { onMount } from 'svelte';
	import { getUserId, openGraphDb, getCsvFileName } from '$lib/graphUtils';
	import { openDB } from '$lib/signUtils';
	import { getAvailableGb, getFileImportDir, writeFile } from '$lib/fileUtils';
	let availableFiles: { [id: string]: string } = {};
	let importDir: FileSystemDirectoryHandle;
	let userId: string;
	async function importSelectedFiles(event: Event) {
		if (event.target) {
			const input = <HTMLInputElement>event.target;
			if (input.files) {
				for (const file of input.files) {
					let { key, value } = await writeFile(importDir, file, userId);
					availableFiles[key] = value;
				}
				gbPromise = getAvailableGb();
			}
		}
	}
	onMount(async () => {
		await init();
		await openGraphDb();
		openDB();
		userId = await getUserId();
		getFileImportDir().then(async (impDir) => {
			importDir = impDir;
			for await (const key of impDir.keys()) {
				availableFiles[key] = await getCsvFileName(key);
			}
		});
	});
	$: gbPromise = getAvailableGb();
	$: hasAlreadyFiles = Object.keys(availableFiles).length > 0;
</script>

<header class="container">
	<hgroup>
		<h1>Analyze your data in the browser</h1>
		{#await gbPromise}
			<p>--(/\)--</p>
		{:then gbs}
			<p>Upload and analyze up to {gbs} GB of CSV files.</p>
		{/await}
	</hgroup>
</header>
<hr />
<section id="import">
	<div class="grid">
		{#if hasAlreadyFiles}
			<div>
				<h3>Available files</h3>
				<div>
					<div class="grid">
						<h4>Id</h4>
						<h4>Name</h4>
					</div>
					{#each Object.entries(availableFiles) as [key, value]}
						<div class="grid">
							<div>{key}</div>
							<div>{value}</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
		<div>
			{#if hasAlreadyFiles}
				<h3>Upload more CSVs</h3>
			{:else}
				<h3>Upload some CSVs</h3>
			{/if}
			<input type="file" multiple accept="text/csv" on:change={(e) => importSelectedFiles(e)} />
		</div>
	</div>
</section>

<script lang="ts">
	import { onMount } from 'svelte';
	import { getUserId } from '$lib/graphUtils';
	import { openDB } from '$lib/signUtils';
	import { getAvailableGb, getFileImportDir, writeFile } from '$lib/fileUtils';
	let availableFiles: { [id: string]: FileSystemFileHandle } = {};
	let importDir: FileSystemDirectoryHandle;
	let userId: string;
	async function importSelectedFiles(event: Event) {
		if (event.target) {
			const input = <HTMLInputElement>event.target;
			if (input.files) {
				for (const file of input.files) {
					writeFile(importDir, file, userId);
				}
				gbPromise = getAvailableGb();
			}
		}
	}
	onMount(async () => {
		openDB();
		userId = await getUserId();
		getFileImportDir().then(async (impDir) => {
			importDir = impDir;
			for await (const [key, value] of impDir.entries()) {
				availableFiles[key] = <FileSystemFileHandle>value;
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
					{#each Object.keys(availableFiles) as key}
						<div>{key}</div>
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

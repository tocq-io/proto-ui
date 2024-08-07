<script lang="ts">
	import init from 'proto-query-engine';
	import {
		Button,
		Fileupload,
		Modal,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import { PlusOutline } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';
	import { getUserId, openGraphDb, getCsvFileName } from '$lib/graphUtils';
	import { openDB } from '$lib/signUtils';
	import { getAvailableGb, getFileImportDir, writeFile } from '$lib/fileUtils';
	let availableFiles: { [id: string]: string } = {};
	let importDir: FileSystemDirectoryHandle;
	let userId: string;
	let defaultModal = false;
	let files: FileList;
	async function importFiles() {
		console.log(files);
		if (files) {
			for (const file of files) {
				let { key, value } = await writeFile(importDir, file, userId);
				availableFiles[key] = value;
			}
			gbPromise = getAvailableGb();
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

<header class="px-8 text-gray-900 dark:text-white">
	<h1 class="pt-12 mb-8 text-8xl tracking-tight font-extrabold">
		Analyze your data in the browser
	</h1>
</header>
<section class="px-8">
	<Table>
		<caption class="p-3">
			<div class="grid gap-4 mb-4 sm:grid-cols-2">
				{#await gbPromise}
					<p class="text-2xl text-left">--(/\)--</p>
				{:then gbs}
					<p class="text-2xl text-left">Upload and analyze up to {gbs} GB of CSV files.</p>
				{/await}
				<div class="text-right">
					<Button on:click={() => (defaultModal = true)}>
						<PlusOutline class="h-3.5 w-3.5 mr-2" /><span class="text-lg">Add CSV</span>
					</Button>
				</div>
			</div>
		</caption>
		<TableHead theadClass="text-lg">
			<TableHeadCell padding="px-4 py-3" scope="col">Id</TableHeadCell>
			<TableHeadCell padding="px-4 py-3" scope="col">Name</TableHeadCell>
		</TableHead>
		<TableBody tableBodyClass="text-lg">
			{#if hasAlreadyFiles}
				{#each Object.entries(availableFiles) as [key, value]}
					<TableBodyRow>
						<TableBodyCell tdClass="px-4 py-3">{key}</TableBodyCell>
						<TableBodyCell tdClass="px-4 py-3">{value}</TableBodyCell>
					</TableBodyRow>
				{/each}
			{/if}
		</TableBody>
	</Table>
	<Modal title="Upload some files" bind:open={defaultModal} autoclose class="min-w-full">
		<div class="grid gap-4 mb-4 sm:grid-cols-2">
			<div class="w-96">
				<Fileupload id="multiple_files" multiple bind:files />
			</div>
			<div class="text-right">
				<Button type="submit" class="w-44" on:click={() => importFiles()}>
					<PlusOutline class="h-3.5 w-3.5 mr-2" />Add new files
				</Button>
			</div>
		</div>
	</Modal>
</section>

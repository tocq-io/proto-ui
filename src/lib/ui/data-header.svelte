<script lang="ts">
	import init from 'proto-query-engine';
	import QueryEdit from './modals/query-edit.svelte';
	import { Button } from 'flowbite-svelte';
	import { PlusOutline } from 'flowbite-svelte-icons';
	import FileSelect from './modals/file-select.svelte';
	import { writable, type Writable } from 'svelte/store';
	import { getAvailableGb, loadFileImportDir, importDir } from '$lib/fileUtils';
	import TablePreview from './modals/table-preview.svelte';
	import { onMount } from 'svelte';
	import { openDB } from '$lib/signUtils';
	import { getDataFile, getImportedData, getQueries, openGraphDb } from '$lib/graphUtils';
	import { addDataNode, addQueryDataEdge, addQueryNode } from '$lib/flowUtils';
	import { type PreviewTable, type SqlEdit } from '$lib/queryUtils';

	let dataUploadModal = writable(false);
	let gbPromise: Writable<Promise<string>>;
	$: gbPromise = writable(getAvailableGb());

	let previewTable: Writable<PreviewTable> = writable({
		view: false,
		table: undefined
	});
	let sqlEditControl: Writable<SqlEdit> = writable({
		view: false,
		sql: ''
	});

	onMount(async () => {
		await init();
		openDB();
		await openGraphDb();
		loadFileImportDir()
			.then(async () => {
				let count = 0;
				for await (const key of importDir.keys()) {
					await getDataFile(key).then((dataFile) =>
						addDataNode(dataFile, key, previewTable, count * 120, 0)
					);
					count++;
				}
			})
			.then(() =>
				getQueries().then((queries) => {
					let count = 1;
					for (const query of queries) {
						getImportedData(query.id).then((edge) => {
							//TODO find out how the edge format is actually returned from surreal
							console.log(edge);
							console.log(edge[0][0]);
							for (const outDestination of edge[0]) {
								const tableId = outDestination.out.id;
								addQueryDataEdge(tableId, query.id.id.toString());
								addQueryNode(query, previewTable, [tableId], sqlEditControl, count * 80, 160);
							}
						});
						count++;
					}
				})
			);
	});
</script>

<header class="px-8 text-gray-900 dark:text-white">
	<h1 class="mb-8 pt-12 text-8xl font-extrabold tracking-tight">
		Analyze your data in the browser
	</h1>
</header>
<section class="px-8">
	<div class="mb-4 grid gap-4 sm:grid-cols-2">
		{#await $gbPromise}
			<p class="text-left text-2xl">--(/\)--</p>
		{:then gbs}
			<p class="text-left text-2xl">Upload and analyze up to {gbs} GB of CSV files.</p>
		{/await}
		<div class="text-right">
			<Button class="h-2/3" on:click={() => dataUploadModal.set(true)}>
				<PlusOutline strokeWidth="4" class="mr-2 h-3.5 w-3.5" /><span class="text-lg">Data</span>
			</Button>
			<Button class="h-2/3" on:click={() => sqlEditControl.set({ view: true, sql: '' })}>
				<PlusOutline strokeWidth="4" class="mr-2 h-3.5 w-3.5" /><span class="text-lg">Query</span>
			</Button>
		</div>
	</div>
	<FileSelect {dataUploadModal} {previewTable} />
	<QueryEdit {sqlEditControl} {previewTable} />
</section>
<section>
	<TablePreview {previewTable} />
</section>

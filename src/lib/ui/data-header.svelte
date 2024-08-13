<script lang="ts">
	import init from 'proto-query-engine';
	import QueryEdit from './modals/query-edit.svelte';
	import { Button } from 'flowbite-svelte';
	import { PlusOutline } from 'flowbite-svelte-icons';
	import FileSelect from './modals/file-select.svelte';
	import { writable, type Writable } from 'svelte/store';
	import { getAvailableGb, loadFileImportDir, importDir} from '$lib/fileUtils';
	import TablePreview from './modals/table-preview.svelte';
	import { onMount } from 'svelte';
	import { openDB } from '$lib/signUtils';
	import { getDataFile, getImportedData, getQueries, openGraphDb } from '$lib/graphUtils';
	import { addDataNode, addQueryDataEdge, addQueryNode, type PreviewData } from '$lib/flowUtils';

	let queryConfigModal = writable(false);
	let dataUploadModal = writable(false);
	let gbPromise: Writable<Promise<string>>;
	$: gbPromise = writable(getAvailableGb());

	let dataView: Writable<PreviewData> = writable({
		view: false,
		id: "",
		name: ""
	});

	onMount(async () => {
		await init();
		openDB();
		await openGraphDb();
		loadFileImportDir()
			.then(async () => {
				let count = 0;
				for await (const key of importDir.keys()) {
					await getDataFile(key).then((dataFile) => addDataNode(dataFile, key, dataView, count * 120, 0));
					count++;
				}
			})
			.then(() =>
				getQueries().then((tfs) => {
					let count = 1;
					for (const tf of tfs) {
						addQueryNode(tf, count * 80, 240);
						getImportedData(tf.id).then((edge) => {
							//TODO find out how the edge format is actually returned from surreal
							console.log(edge);
							console.log(edge[0][0]);
							addQueryDataEdge(edge[0][0].out.id, tf.id.id.toString());
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
			<Button class="h-2/3" on:click={() => queryConfigModal.set(true)}>
				<PlusOutline strokeWidth="4" class="mr-2 h-3.5 w-3.5" /><span class="text-lg">Query</span>
			</Button>
		</div>
	</div>
	<FileSelect dataUploadModal={dataUploadModal} {dataView} />
	<QueryEdit {queryConfigModal} />
</section>
<section>
	<TablePreview previewData={dataView} />
</section>

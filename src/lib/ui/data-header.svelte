<script lang="ts">
	import init from 'proto-query-engine';
	import QueryEdit from '$lib/ui/modals/query-edit.svelte';
	import { Button } from 'flowbite-svelte';
	import { PlusOutline } from 'flowbite-svelte-icons';
	import FileSelect from '$lib/ui/modals/file-select.svelte';
	import { writable, type Writable } from 'svelte/store';
	import { getAvailableGb, loadInit } from '$lib/fileUtils';
	import TablePreview from '$lib/ui/modals/table-preview.svelte';
	import { onMount } from 'svelte';
	import { openDB } from '$lib/signUtils';
	import { openGraphDb } from '$lib/graphUtils';
	import { sqlEditControl } from '$lib/flowUtils';

	let dataUploadModal = writable(false);
	let gbPromise: Writable<Promise<string>>;
	$: gbPromise = writable(getAvailableGb());

	onMount(async () => {
		await init();
		openDB();
		await openGraphDb();
		loadInit();
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
	<FileSelect {dataUploadModal} />
	<QueryEdit />
</section>
<section>
	<TablePreview />
</section>

<script lang="ts">
	import SqlEdit from './modals/sql-edit.svelte';
	import { Button } from 'flowbite-svelte';
	import { PlusOutline } from 'flowbite-svelte-icons';
	import FileSelect from './modals/file-select.svelte';
	import { writable, type Writable } from 'svelte/store';
	import { getAvailableGb } from '$lib/fileUtils';

	let sqlConfigModal = writable(false);
	let csvUploadModal = writable(false);
	let gbPromise: Writable<Promise<string>>;
	$: gbPromise = writable(getAvailableGb());
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
			<Button on:click={() => csvUploadModal.set(true)}>
				<PlusOutline class="mr-2 h-3.5 w-3.5" /><span class="text-lg">Data</span>
			</Button>
			<Button on:click={() => sqlConfigModal.set(true)}>
				<PlusOutline class="mr-2 h-3.5 w-3.5" /><span class="text-lg">SQL</span>
			</Button>
		</div>
	</div>
	<FileSelect {csvUploadModal} />
	<SqlEdit {sqlConfigModal} />
</section>

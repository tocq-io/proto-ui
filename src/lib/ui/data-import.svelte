<script lang="ts">
	import init from 'proto-query-engine';
	import {
		Button,
		Fileupload,
		Modal
	} from 'flowbite-svelte';
	import { PlusOutline } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';
	import { openDB } from '$lib/signUtils';
	import { getAvailableGb, writeFile } from '$lib/fileUtils';

	let defaultModal = false;
	let files: FileList;
	async function importFiles() {
		if (files) {
			for (const file of files) {
				writeFile(file);
			}
			gbPromise = getAvailableGb();
		}
	}
	onMount(async () => {
		await init();
		openDB();
	});
	$: gbPromise = getAvailableGb();
</script>

<header class="px-8 text-gray-900 dark:text-white">
	<h1 class="pt-12 mb-8 text-8xl tracking-tight font-extrabold">
		Analyze your data in the browser
	</h1>
</header>
<section class="px-8">
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

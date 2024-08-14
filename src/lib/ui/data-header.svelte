<script lang="ts">
	import init from 'proto-query-engine';
	import { Button } from 'flowbite-svelte';
	import { PlusOutline } from 'flowbite-svelte-icons';
	import { writable, type Writable } from 'svelte/store';
	import { getAvailableGb, loadInit } from '$lib/fileUtils';
	import { onMount } from 'svelte';
	import { openDB } from '$lib/signUtils';
	import { openGraphDb } from '$lib/graphUtils';
	import { sqlEditControl, showDataUpload } from '$lib/flowUtils';
	
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
	<h1 class="mb-8 pt-12 text-8xl font-extrabold tracking-tight">tocq.io > local data tooling</h1>
</header>
<section class="px-8">
	<div class="mb-4 grid gap-4 sm:grid-cols-2">
		<div>
			{#await $gbPromise}
				<p class="text-left text-2xl">--(/\)--</p>
			{:then gbs}
				<p class="text-left text-2xl">
					Analyze up to {gbs} GB of data files directly in your browser.
				</p>
			{/await}
		</div>
		<div class="text-right">
			<Button class="h-2/3" on:click={() => $showDataUpload = true}>
				<PlusOutline strokeWidth="4" class="mr-2 h-3.5 w-3.5" /><span class="text-lg">Data</span>
			</Button>
			<Button class="h-2/3" on:click={() => $sqlEditControl.view = true}>
				<PlusOutline strokeWidth="4" class="mr-2 h-3.5 w-3.5" /><span class="text-lg">Query</span>
			</Button>
			<Button class="h-2/3" disabled>
				<PlusOutline strokeWidth="4" class="mr-2 h-3.5 w-3.5" /><span class="text-lg">View</span>
			</Button>
			<Button class="h-2/3" disabled>
				<PlusOutline strokeWidth="4" class="mr-2 h-3.5 w-3.5" /><span class="text-lg">Service</span>
			</Button>
		</div>
	</div>
</section>

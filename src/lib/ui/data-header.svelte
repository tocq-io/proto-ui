<script lang="ts">
	import init, {init_panic_hook} from 'proto-query-engine';
	import { Button } from 'flowbite-svelte';
	import { PlusOutline } from 'flowbite-svelte-icons';
	import { writable, type Writable } from 'svelte/store';
	import { getAvailableGb } from '$lib/fileUtils';
	import { initFlow } from '$lib/flowUtils';
	import { onMount } from 'svelte';
	import { openDB } from '$lib/signUtils';
	import { openGraphDb } from '$lib/graphUtils';
	import { sqlEditControl, showDataUpload, showChartEditor } from '$lib/storeUtils';

	let gbPromise: Writable<Promise<string>>;

	function setSqlControl() {
		sqlEditControl.set({
			view: true,
			queryId: '',
			sql: '',
		});
	}

	$: gbPromise = writable(getAvailableGb());

	onMount(async () => {
		await init();
		// Debug only
		await init_panic_hook();
		openDB();
		await openGraphDb();
		initFlow();
	});
</script>

<header class="px-8 text-gray-900 dark:text-white">
	<h1 class="mb-4 pt-4 text-6xl font-extrabold tracking-tight">tocq.io > data on the edge</h1>
</header>
<section class="px-8">
	<div class="mb-4 grid gap-4 sm:grid-cols-2">
		<div class="dark:text-white">
			{#await $gbPromise}
				<p class="text-left text-2xl">--(/\)--</p>
			{:then gbs}
				<p class="text-left text-2xl">
					Analyze up to {gbs} GB of data locally, then push it to the edge.
				</p>
			{/await}
		</div>
		<div class="text-right">
			<Button class="h-2/3" on:click={() => ($showDataUpload = true)}>
				<PlusOutline strokeWidth="4" class="mr-2 h-3.5 w-3.5" /><span class="text-lg">Data</span>
			</Button>
			<Button class="h-2/3" on:click={() => setSqlControl()}>
				<PlusOutline strokeWidth="4" class="mr-2 h-3.5 w-3.5" /><span class="text-lg">Query</span>
			</Button>
			<Button class="h-2/3" on:click={() => ($showChartEditor = true)}>
				<PlusOutline strokeWidth="4" class="mr-2 h-3.5 w-3.5" /><span class="text-lg">View</span>
			</Button>
			<Button class="h-2/3" disabled>
				<PlusOutline strokeWidth="4" class="mr-2 h-3.5 w-3.5" /><span class="text-lg">Service</span>
			</Button>
		</div>
	</div>
</section>

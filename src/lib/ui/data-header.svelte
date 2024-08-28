<script lang="ts">
	import { Button } from 'flowbite-svelte';
	import { PlusOutline } from 'flowbite-svelte-icons';
	import { writable, type Writable } from 'svelte/store';
	import { getAvailableGb } from '$lib/fileUtils';
	import { showDataUpload } from '$lib/storeUtils';
	import { addEmptyQueryNode } from '$lib/flowUtils';

	let gbPromise: Writable<Promise<string>>;

	$: gbPromise = writable(getAvailableGb());
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
			<Button class="h-2/3" on:click={() => addEmptyQueryNode()}>
				<PlusOutline strokeWidth="4" class="mr-2 h-3.5 w-3.5" /><span class="text-lg">Query</span>
			</Button>
			<Button class="h-2/3" disabled>
				<PlusOutline strokeWidth="4" class="mr-2 h-3.5 w-3.5" /><span class="text-lg">Model</span>
			</Button>
			<Button class="h-2/3" disabled>
				<PlusOutline strokeWidth="4" class="mr-2 h-3.5 w-3.5" /><span class="text-lg">Function</span>
			</Button>
		</div>
	</div>
</section>

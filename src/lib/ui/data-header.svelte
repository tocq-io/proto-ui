<script lang="ts">
	import { writable, type Writable } from 'svelte/store';
	import { getAvailableGb } from '$lib/fileUtils';

	let gbPromise: Writable<Promise<string>>;

	$: gbPromise = writable(getAvailableGb());
</script>

<header class="px-8 text-gray-900 dark:text-white">
	<div class="flex gap-3 mb-4 pt-4 ">
		<h1 class="text-6xl font-extrabold tracking-tight"><nobr>tocq.io > data on the edge</nobr></h1>
		{#await $gbPromise}
			<span class="text-right text-2xl">--(/\)--</span>
		{:then gbs}
			<span class="text-right text-md w-full align-text-bottom mt-9 font-semibold"
				>Avalailable browser storage: {gbs} GB</span
			>
		{/await}
	</div>
</header>

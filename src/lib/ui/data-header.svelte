<script lang="ts">
	import { writable, type Writable } from 'svelte/store';
	import { getAvailableGb } from '$lib/fileUtils';

	let gbPromise: Writable<Promise<string>>;

	$: gbPromise = writable(getAvailableGb());
</script>

<header class="px-8 text-gray-900 dark:text-white">
		<h1 class="text-4xl font-extrabold tracking-tight"><nobr>tocq.io > data on the edge</nobr></h1>
		{#await $gbPromise}
			<span class="text-xl">--(/\)--</span>
		{:then gbs}
			<span class="text-md font-semibold"
				>Avalailable browser storage: {gbs} GB</span
			>
		{/await}
</header>

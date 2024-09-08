<script lang="ts">
	import { writable, type Writable } from 'svelte/store';
	import { getAvailableGb } from '$lib/fileUtils';

	let gbPromise: Writable<Promise<string>>;

	$: gbPromise = writable(getAvailableGb());
</script>
<footer class="px-8 text-gray-900 dark:text-white">
{#await $gbPromise}
<span class="text-xl">--(/\)--</span>
{:then gbs}
<span class="text-md font-semibold">Avalailable OPFS storage: {gbs} GB</span>
{/await}
</footer>
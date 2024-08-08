<script lang="ts">
	import { writable } from 'svelte/store';
	import { SvelteFlow, Background, Controls, MiniMap } from '@xyflow/svelte';
	import { onMount } from 'svelte';
	import { loadFileImportDir, importDir, nodes, addFileNode } from '$lib/fileUtils';
	import { openGraphDb, getCsvFileName } from '$lib/graphUtils';

	import '@xyflow/svelte/dist/style.css';

	const edges = writable([]);

	onMount(async () => {
		await openGraphDb();
		loadFileImportDir().then(async () => {
			for await (const key of importDir.keys()) {
				getCsvFileName(key).then((tableName) => addFileNode(key, tableName));
			}
		});
	});
</script>

<section class="h-screen px-8">
	<div class="h-3/5 overview border-slate-500 border-dotted border-2">
		<SvelteFlow {nodes} {edges}>
			<Background />
			<Controls />
			<MiniMap zoomable pannable height={120} />
		</SvelteFlow>
	</div>
</section>

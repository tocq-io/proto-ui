<script lang="ts">
	import { SvelteFlow, Background, Controls, MiniMap } from '@xyflow/svelte';
	import { onMount } from 'svelte';
	import { loadFileImportDir, importDir } from '$lib/fileUtils';
	import { nodes, edges, addCsvNode } from '$lib/flowUtils';
	import { openGraphDb, getCsvFileName } from '$lib/graphUtils';
	import { openDB } from '$lib/signUtils';
	import CsvFile from '$lib/ui/nodes/csv-file.svelte';

	import '@xyflow/svelte/dist/style.css';

	const nodeTypes = {
		csvNode: CsvFile
	};

	onMount(async () => {
		openDB();
		await openGraphDb();
		loadFileImportDir().then(async () => {
			for await (const key of importDir.keys()) {
				getCsvFileName(key).then((tableName) => addCsvNode(key, tableName, 22));
			}
		});
	});
</script>

<section class="h-screen px-8">
	<div class="overview h-3/5 border-2 border-dotted border-slate-500">
		<SvelteFlow {nodes} {edges} {nodeTypes}>
			<Background />
			<Controls />
			<MiniMap zoomable pannable height={120} />
		</SvelteFlow>
	</div>
</section>

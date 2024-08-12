<script lang="ts">
	import { SvelteFlow, Background, Controls, MiniMap } from '@xyflow/svelte';
	import { onMount } from 'svelte';
	import { loadFileImportDir, importDir } from '$lib/fileUtils';
	import { nodes, edges, addDataNode, addTransformerNode, addTfDataEdge } from '$lib/flowUtils';
	import { openGraphDb, getDataFile, getTransformers, getImportedData } from '$lib/graphUtils';
	import { openDB } from '$lib/signUtils';
	import DataFile from '$lib/ui/nodes/data-file.svelte';
	import Transfomer from '$lib/ui/nodes/transfomer.svelte';

	import '@xyflow/svelte/dist/style.css';

	const nodeTypes = {
		dataNode: DataFile,
		tfNode: Transfomer
	};

	onMount(async () => {
		openDB();
		await openGraphDb();
		loadFileImportDir()
			.then(async () => {
				let count = 0;
				for await (const key of importDir.keys()) {
					await getDataFile(key).then((dataFile) => addDataNode(dataFile, key, count * 120, 0));
					count++;
				}
			})
			.then(() =>
				getTransformers().then((tfs) => {
					let count = 1;
					for (const tf of tfs) {
						addTransformerNode(tf, count * 120, 160);
						getImportedData(tf.id).then((edge) => {
							//TODO find out how the edge format is actually returned from surreal
							console.log(edge);
							console.log(edge[0][0]);
							addTfDataEdge(edge[0][0].out.id, tf.id.id.toString());
						});
						count++;
					}
				})
			);
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

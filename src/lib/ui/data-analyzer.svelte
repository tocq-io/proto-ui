<script lang="ts">
	import { SvelteFlow, Background, Controls, MiniMap } from '@xyflow/svelte';
	import { nodes, edges } from '$lib/flowUtils';
	import DataFile from '$lib/ui/nodes/data-file.svelte';
	import Query from '$lib/ui/nodes/query.svelte';

	import '@xyflow/svelte/dist/style.css';

	const nodeTypes = {
		dataNode: DataFile,
		queryNode: Query
	};
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

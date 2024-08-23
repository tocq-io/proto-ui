<script lang="ts">
	import {
		SvelteFlow,
		Background,
		Controls,
		MiniMap,
		type EdgeTypes
	} from '@xyflow/svelte';
	import { nodes, edges } from '$lib/storeUtils';
	import DataFile from '$lib/ui/nodes/data-file.svelte';
	import Query from '$lib/ui/nodes/query.svelte';

	import '@xyflow/svelte/dist/style.css';
	import FileSelect from '$lib/ui/modals/file-select.svelte';
	import QueryEdit from '$lib/ui/modals/query-edit.svelte';
	import TablePreview from '$lib/ui/modals/table-preview.svelte';
	import QueryDataEdge from '$lib/ui/nodes/query-data-edge.svelte';
	import ChartEdit from '$lib/ui/modals/chart-edit.svelte';

	const nodeTypes = {
		dataNode: DataFile,
		queryNode: Query
	};
	const edgeTypes: EdgeTypes = {
		queryDataEdge: QueryDataEdge
	};
</script>

<section>
	<FileSelect />
	<QueryEdit />
	<ChartEdit />
	<TablePreview />
</section>
<section class="px-8" style="height: 70dvh">
	<div class="overview h-full border-2 border-dotted border-slate-500">
		<SvelteFlow {nodes} {edges} {nodeTypes} {edgeTypes}>
			<Background />
			<Controls />
			<MiniMap zoomable pannable height={120} />
		</SvelteFlow>
	</div>
</section>

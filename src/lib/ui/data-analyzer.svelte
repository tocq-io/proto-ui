<script lang="ts">
	import init, { init_panic_hook } from 'proto-query-engine';
	import {
		SvelteFlow,
		Background,
		Controls,
		MiniMap,
		type EdgeTypes,
		useSvelteFlow,
		type Node,
		type Edge,
		Panel
	} from '@xyflow/svelte';
	import ELK, { type ElkNode, type LayoutOptions } from 'elkjs/lib/elk.bundled.js';
	import { nodes, edges } from '$lib/storeUtils';
	import DataFile from '$lib/ui/nodes/data-file.svelte';
	import Query from '$lib/ui/nodes/query.svelte';
	import QueryDataEdge from '$lib/ui/nodes/query-data-edge.svelte';
	import Chart from '$lib/ui/nodes/chart.svelte';

	import '@xyflow/svelte/dist/style.css';
	import { onMount } from 'svelte';
	import { initFlow } from '$lib/flowUtils';
	import { openDB } from '$lib/signUtils';
	import { openGraphDb } from '$lib/graphUtils';
	import { Button } from 'flowbite-svelte';

	const nodeTypes = {
		dataNode: DataFile,
		queryNode: Query,
		chartNode: Chart
	};
	const edgeTypes: EdgeTypes = {
		queryDataEdge: QueryDataEdge
	};

	const { fitView } = useSvelteFlow();

	const elk = new ELK();

	// Elk has a *huge* amount of options to configure. To see everything you can
	// tweak check out:
	//
	// - https://www.eclipse.org/elk/reference/algorithms.html
	// - https://www.eclipse.org/elk/reference/options.html
	const elkOptions = {
		'elk.algorithm': 'layered',
		'elk.layered.spacing.nodeNodeBetweenLayers': '200',
		'elk.spacing.nodeNode': '640',
		'elk.direction': 'DOWN'
	};
	function getLayoutedElements(nodes: Node[], edges: Edge[], options: LayoutOptions = {}) {
		const graph: ElkNode = {
			id: 'root',
			layoutOptions: options,
			children: nodes.map((node) => ({
				...node
			})),
			edges: edges
		};

		return elk
			.layout(graph)
			.then((layoutedGraph) => ({
				nodes: layoutedGraph.children?.map((node) => ({
					...node,
					position: { x: node.x, y: node.y }
				})),

				edges: layoutedGraph.edges
			}))
			.catch(console.error);
	}

	function goLayout() {
		//const opts = { 'elk.direction': 'DOWN', ...elkOptions };
		getLayoutedElements($nodes, $edges, elkOptions).then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
			$nodes = layoutedNodes;
      		$edges = layoutedEdges;
			fitView();
			window.requestAnimationFrame(() => fitView());
		});
	}

	onMount(async () => {
		await init();
		// Debug only
		await init_panic_hook();
		openDB();
		await openGraphDb();
		await initFlow();
		//goLayout();
	});
</script>

<section class="px-8">
	<div class="overview h-full border-2 border-dotted border-slate-500" style="height: 70dvh">
		<SvelteFlow {nodes} {edges} {nodeTypes} {edgeTypes}>
			<Panel position="top-right">
				<Button on:click={() => goLayout()} class="h-6 w-4/5"><nobr>Balance layout</nobr></Button>
			</Panel>
			<Background />
			<Controls />
			<MiniMap zoomable pannable height={120} />
		</SvelteFlow>
	</div>
</section>

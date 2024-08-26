<script lang="ts">
	import init, { init_panic_hook } from 'proto-query-engine';
	import {
		SvelteFlow,
		Background,
		Controls,
		MiniMap,
		type EdgeTypes,
		useSvelteFlow,
		Panel,
		type Node
	} from '@xyflow/svelte';
	import ELK, { type ElkExtendedEdge, type ElkNode } from 'elkjs/lib/elk.bundled.js';
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

	const fitViewOptions = {
     padding: 0,
     minZoom: 0,
     maxZoom: 0.1,
     duration: 0,
    };

	const elk = new ELK();

	// Elk has a *huge* amount of options to configure. To see everything you can
	// tweak check out:
	//
	// - https://www.eclipse.org/elk/reference/algorithms.html
	// - https://www.eclipse.org/elk/reference/options.html
	const elkOptions = {
		'elk.algorithm': 'layered',
		'elk.layered.spacing.nodeNodeBetweenLayers': '240',
		'elk.spacing.nodeNode': '640',
		'elk.direction': 'DOWN'
	};
	async function goLayout() {
		let elkEdges: ElkExtendedEdge[] = [];
		for (const edge of $edges) {
			elkEdges.push({
				id: edge.id,
				sources: [edge.source],
				targets: [edge.target]
			});
		}
		let elkNodes: ElkNode[] = [];
		for (const node of $nodes) {
			elkNodes.push({
				id: node.id,
				x: node.position.x,
				y: node.position.y
			});
		}
		const graph: ElkNode = {
			id: 'tocq_root',
			layoutOptions: elkOptions,
			children: elkNodes,
			edges: elkEdges
		};

		await elk
			.layout(graph)
			.then((layoutedGraph) => {
				if (layoutedGraph.children) {
					let layoutedNodes: Node[] = [];
					layoutedGraph.children.map((lNode) => {
						const node = $nodes.find((node) => node.id === lNode.id);
						if (node) {
							layoutedNodes.push({
								...node,
								position: { x: lNode.x ? lNode.x : 0, y: lNode.y ? lNode.y : 0 }
							});
						}
					});
					nodes.set(layoutedNodes);
				}
			})
			.then(() => fitView());
	}

	onMount(async () => {
		await init();
		// Debug only
		init_panic_hook();
		openDB();
		await openGraphDb();
		await initFlow()
			.then(() => goLayout());
	});
</script>

<section class="px-8">
	<div class="overview h-full border-2 border-dotted border-slate-500" style="height: 70dvh;">
		<SvelteFlow {nodes} {edges} {nodeTypes} {edgeTypes} fitView {fitViewOptions}>
			<Panel position="top-right">
				<Button on:click={() => goLayout()} class="h-6 w-4/5"><nobr>Balance layout</nobr></Button>
			</Panel>
			<Background />
			<Controls />
			<MiniMap zoomable pannable height={120} />
		</SvelteFlow>
	</div>
</section>

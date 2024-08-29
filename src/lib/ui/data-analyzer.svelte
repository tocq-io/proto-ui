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
	import { nodes, edges, errorView, resetGraph } from '$lib/storeUtils';
	import DataFile from '$lib/ui/nodes/data-file.svelte';
	import Query from '$lib/ui/nodes/query.svelte';
	import QueryDataEdge from '$lib/ui/nodes/query-data-edge.svelte';
	import { showDataUpload } from '$lib/storeUtils';
	import { onMount } from 'svelte';
	import { addEmptyQueryNode, initFlow } from '$lib/flowUtils';
	import { openDB, resetKeys } from '$lib/signUtils';
	import { deleteItAll, openGraphDb } from '$lib/graphUtils';
	import { Alert, Button, ButtonGroup } from 'flowbite-svelte';
	import { BullhornOutline, PlayOutline, PlusOutline } from 'flowbite-svelte-icons';
	import '@xyflow/svelte/dist/style.css';
	import { resetImportDir } from '$lib/fileUtils';

	const nodeTypes = {
		dataNode: DataFile,
		queryNode: Query
	};
	const edgeTypes: EdgeTypes = {
		queryDataEdge: QueryDataEdge
	};

	const { fitView } = useSvelteFlow();

	const fitViewOptions = {
		padding: 0,
		minZoom: 0,
		maxZoom: 1,
		duration: 0
	};

	const elk = new ELK();

	// Elk has a *huge* amount of options to configure. To see everything you can
	// tweak check out:
	//
	// - https://www.eclipse.org/elk/reference/algorithms.html
	// - https://www.eclipse.org/elk/reference/options.html
	const elkOptions = {
		'elk.algorithm': 'layered',
		'elk.layered.spacing.nodeNodeBetweenLayers': '360',
		'elk.spacing.nodeNode': '640',
		'elk.direction': 'DOWN'
	};
	async function goLayout() {
		if ($nodes.length === 0 || $edges.length === 0) return;
		console.log("really trying here")
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
			.then(() => (window.requestAnimationFrame(() => fitView())));
	}

	async function resetLocalData() {
		resetImportDir().then(() =>
			deleteItAll().then(() => {
				resetKeys();
				resetGraph();
				window.location.reload();
			})
		);
	}

	onMount(async () => {
		await init();
		// Debug only
		init_panic_hook();
		openDB();
		await openGraphDb();
		await initFlow().then(() => goLayout());
	});
</script>

<section class="px-8">
	<div class="overview h-full border-2 border-dotted border-slate-500" style="height: 85dvh;">
		<SvelteFlow {nodes} {edges} {nodeTypes} {edgeTypes} fitView {fitViewOptions}>
			<Panel position="top-right">
				<ButtonGroup>
					<Button class="h-6" on:click={() => ($showDataUpload = true)}>
						<PlusOutline class="mr-0.5 h-3.5 w-3.5" /><span class="text-md">Data</span>
					</Button>
					<Button class="h-6" on:click={() => addEmptyQueryNode()}>
						<PlusOutline class="mr-0.5 h-3.5 w-3.5" /><span class="text-md">Query</span>
					</Button>
					<Button class="h-6" disabled>
						<PlusOutline class="mr-0.5 h-3.5 w-3.5" /><span class="text-md">Model</span>
					</Button>
					<Button class="h-6" disabled>
						<PlusOutline class="mr-0.5 h-3.5 w-3.5" /><span class="text-md">Function</span>
					</Button>
					<Button class="h-6" disabled>
						<PlayOutline class="mr-0.5 h-3.5 w-3.5" /><span class="text-md">Publish</span>
					</Button>
					<Button class="h-6" disabled>
						<PlayOutline class="mr-0.5 h-3.5 w-3.5" /><span class="text-md">Share</span>
					</Button>
					<Button class="h-6" disabled>
						<PlayOutline class="mr-0.5 h-3.5 w-3.5" /><span class="text-md">Deploy</span>
					</Button>
					<Button class="h-6" on:click={() => resetLocalData()}>
						<PlayOutline class="mr-0.5 h-3.5 w-3.5" /><span class="text-md">Reset</span>
					</Button>
					<Button on:click={() => goLayout()} class="h-6"
						><span class="text-md">Layout</span></Button
					>
				</ButtonGroup>
			</Panel>
			<Panel position="top-left" style="visibility: {$errorView.visibility}; width: 50%;">
				<Alert color={$errorView.color}>
					<BullhornOutline slot="icon" class="h-5 w-5" />
					<span class="text-sm font-medium">{$errorView.msg}</span>
				</Alert>
			</Panel>
			<Background />
			<Controls />
			<MiniMap zoomable pannable height={120} />
		</SvelteFlow>
	</div>
</section>

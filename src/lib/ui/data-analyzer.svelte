<script lang="ts">
	import {
		SvelteFlow,
		Background,
		Controls,
		MiniMap,
		type EdgeTypes,
		Panel,
		Position,
		type Node
	} from '@xyflow/svelte';
	import dagre from '@dagrejs/dagre';
	import { nodes, edges, errorView, resetGraph } from '$lib/storeUtils';
	import DataFile from '$lib/ui/nodes/data-file.svelte';
	import Query from '$lib/ui/nodes/query.svelte';
	import QueryDataEdge from '$lib/ui/nodes/query-data-edge.svelte';
	import { showDataUpload } from '$lib/storeUtils';
	import { onMount } from 'svelte';
	import { addEmptyQueryNode, initFlow } from '$lib/flowUtils';
	import { openDB, resetKeys } from '$lib/signUtils';
	import {
		deleteItAll,
		openGraphDb,
		updateDataFilePosition,
		updateDfSqlFilePosition
	} from '$lib/graphUtils';
	import { Alert, Button, ButtonGroup } from 'flowbite-svelte';
	import {
		BullhornOutline,
		CloseCircleOutline,
		PlayOutline,
		PlusOutline
	} from 'flowbite-svelte-icons';
	import '@xyflow/svelte/dist/style.css';
	import { resetImportDir } from '$lib/fileUtils';
	import { initDfSql } from '$lib/dfSqlUtils';

	const nodeTypes = {
		dataNode: DataFile,
		queryNode: Query
	};
	const edgeTypes: EdgeTypes = {
		queryDataEdge: QueryDataEdge
	};

	function doLayout() {
		const dagreGraph = new dagre.graphlib.Graph();
		dagreGraph.setDefaultEdgeLabel(() => ({}));
		dagreGraph.setGraph({ rankdir: 'TB' });

		$nodes.forEach((node) => {
			if (node.measured && node.measured.width && node.measured.height) {
				dagreGraph.setNode(node.id, { width: node.measured.width, height: node.measured.height });
			}
		});

		$edges.forEach((edge) => {
			dagreGraph.setEdge(edge.source, edge.target);
		});

		dagre.layout(dagreGraph);

		$nodes.forEach((node) => {
			const nodeWithPosition = dagreGraph.node(node.id);
			node.targetPosition = Position.Top;
			node.sourcePosition = Position.Bottom;

			if (node.measured && node.measured.width && node.measured.height) {
				node.position = {
					x: nodeWithPosition.x - node.measured.width / 2 + 50,
					y: nodeWithPosition.y - node.measured.height / 2 + 50
				};
			}
		});

		storeUpdateNodesSync($nodes);

		// triggers a redraw in xyflow
		nodes.set($nodes);
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

	async function storeUpdateNodesSync(nodes: Node[]){
		for (const node of nodes) {
			await storeNodePosition(node);
		}
	}

	async function storeNodePosition(node: Node) {
		switch (node.type) {
			case 'queryNode':
				await  updateDfSqlFilePosition(node.position, node.id);
				break;
			case 'dataNode':
				await updateDataFilePosition(node.position, node.id);
				break;
		}
	}

	async function peristNodePositionAfterDrag(e: CustomEvent) {
		storeNodePosition(e.detail.targetNode);
	}

	onMount(async () => {
		await initDfSql();
		openDB();
		await openGraphDb(); 
		initFlow();
	});
</script>

<section class="px-8">
	<div class="overview h-full border-2 border-dotted border-slate-500" style="height: 85dvh;">
		<SvelteFlow
			{nodes}
			{edges}
			{nodeTypes}
			{edgeTypes}
			on:nodedragstop={(e) => peristNodePositionAfterDrag(e)}
		>
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
					<Button on:click={() => doLayout()} class="h-6"
						><span class="text-md">Layout</span></Button
					>
				</ButtonGroup>
			</Panel>
			<Panel position="top-left" style="visibility: {$errorView.visibility}; width: 33%;">
				<Alert color={$errorView.color} dismissable>
					<BullhornOutline slot="icon" class="h-5 w-5" />
					<span class="text-sm font-medium">{$errorView.msg}</span>
					<Button
						slot="close-button"
						size="xs"
						pill
						on:click={() => ($errorView.visibility = 'hidden')}
						class="ms-auto h-6 w-6"
						><CloseCircleOutline color="white" size="lg" strokeWidth="3" /></Button
					>
				</Alert>
			</Panel>
			<Background />
			<Controls />
			<MiniMap zoomable pannable height={120} />
		</SvelteFlow>
	</div>
</section>

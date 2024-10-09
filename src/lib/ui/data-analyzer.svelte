<script lang="ts">
	import {
		SvelteFlow,
		Background,
		Controls,
		MiniMap,
		type EdgeTypes,
		Panel,
		Position,
		type Node,
		type Viewport,
		ControlButton
	} from '@xyflow/svelte';
	import dagre from '@dagrejs/dagre';
	import { nodes, edges, errorView, resetGraph } from '$lib/storeUtils';
	import DataFile from '$lib/ui/nodes/data-file.svelte';
	import Query from '$lib/ui/nodes/query.svelte';
	import QueryDataEdge from '$lib/ui/nodes/query-data-edge.svelte';
	import { showDataUpload } from '$lib/storeUtils';
	import { onMount, onDestroy } from 'svelte';
	import { addEmptyQueryNode, initFlow } from '$lib/flowUtils';
	import { openDB, resetKeys } from '$lib/signUtils';
	import {
		deleteItAll,
		openGraphDb,
		updateDataFilePosition,
		updateDfSqlFilePosition
	} from '$lib/graphUtils';
	import { Alert, Button, SpeedDial, SpeedDialButton } from 'flowbite-svelte';
	import {
		BrainOutline,
		BullhornOutline,
		CirclePlusOutline,
		CloseCircleOutline,
		CloudArrowUpOutline,
		DatabaseOutline,
		ExpandOutline,
		FacebookSolid,
		RocketOutline,
		ShareAllOutline,
		TrashBinOutline,
		TruckOutline,
		UploadOutline
	} from 'flowbite-svelte-icons';
	import '@xyflow/svelte/dist/style.css';
	import { resetImportDir } from '$lib/fileUtils';
	import { initDfSql } from '$lib/dfSqlUtils';
	import { writable, type Writable } from 'svelte/store';

	const nodeTypes = {
		dataNode: DataFile,
		queryNode: Query
	};
	const edgeTypes: EdgeTypes = {
		queryDataEdge: QueryDataEdge
	};
	let viewport: Writable<Viewport> = writable({ x: 0, y: 0, zoom: 0.7 });
	const fitViewOptions = {
		minZoom: 0.6,
		duration: 0,
		nodes: $nodes
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
					y: nodeWithPosition.y - node.measured.height / 2 + 70
				};
			}
		});

		storeUpdateNodesSync($nodes);

		// triggers a redraw in xyflow
		nodes.set($nodes);
	}

	async function resetLocalData() {
		await resetImportDir().then(() =>
			deleteItAll().then(() => {
				resetKeys();
				resetGraph();
				window.location.reload();
			})
		);
	}

	async function storeUpdateNodesSync(nodes: Node[]) {
		for (const node of nodes) {
			await storeNodePosition(node);
		}
	}

	async function storeNodePosition(node: Node) {
		switch (node.type) {
			case 'queryNode':
				await updateDfSqlFilePosition(node.position, node.id);
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
		openDB();
		await initDfSql();
		await openGraphDb();
		await initFlow();
	});

	onDestroy(async () => {
		// TODO, needs the db to be owned by this view or a backend storage..
		// storeViewPort($viewport.x, $viewport.y, $viewport.zoom);
	});
</script>

<section>
	<div class="overview h-full" style="height: 100vh;">
		<SvelteFlow
			{nodes}
			{edges}
			{nodeTypes}
			{edgeTypes}
			{viewport}
			fitView
			{fitViewOptions}
			on:nodedragstop={(e) => peristNodePositionAfterDrag(e)}
		>
			<Panel position="top-right">
				<SpeedDial color="purpleToPink" gradient defaultClass="end-5 bottom-5" placement="left">
					<CirclePlusOutline class="h-6 w-6" slot="icon" />
					<SpeedDialButton name="Model" disabled tooltip="bottom">
						<BrainOutline color="purple" class="h-6 w-6" />
					</SpeedDialButton>
					<SpeedDialButton name="Function" disabled tooltip="bottom">
						<FacebookSolid color="purple" class="h-6 w-6" />
					</SpeedDialButton>
					<SpeedDialButton name="Data" tooltip="bottom" on:click={() => ($showDataUpload = true)}>
						<UploadOutline color="purple" class="h-6 w-6" />
					</SpeedDialButton>
					<SpeedDialButton name="Query" tooltip="bottom" on:click={() => addEmptyQueryNode()}>
						<DatabaseOutline color="purple" class="h-6 w-6" />
					</SpeedDialButton>
				</SpeedDial>
				<SpeedDial color="greenToBlue" gradient defaultClass="mt-2" placement="bottom">
					<TruckOutline class="h-6 w-6" slot="icon" />
					<SpeedDialButton name="Publish" disabled tooltip="left">
						<RocketOutline color="green" class="h-6 w-6" />
					</SpeedDialButton>
					<SpeedDialButton name="Share" disabled tooltip="left">
						<ShareAllOutline color="green" class="h-6 w-6" />
					</SpeedDialButton>
					<SpeedDialButton name="Deploy" disabled tooltip="left">
						<CloudArrowUpOutline color="green" class="h-6 w-6" />
					</SpeedDialButton>
				</SpeedDial>
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
			<Controls>
				<ControlButton title="shuffle layout" on:click={() => doLayout()}>
					<ExpandOutline class="w-5" />
				</ControlButton>
				<ControlButton title="reset everything" on:click={() => resetLocalData()}>
					<TrashBinOutline />
				</ControlButton>
			</Controls>
			<MiniMap zoomable pannable height={120} />
		</SvelteFlow>
	</div>
</section>

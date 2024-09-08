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
		BrainSolid,
		BullhornOutline,
		CirclePlusOutline,
		CirclePlusSolid,
		CloseCircleOutline,
		CloudArrowUpOutline,
		CloudArrowUpSolid,
		DatabaseOutline,
		ExpandOutline,
		FacebookSolid,
		PlayOutline,
		PlusOutline,
		RocketOutline,
		RocketSolid,
		ShareAllOutline,
		ShareAllSolid,
		TrashBinOutline,
		TruckOutline,
		TruckSolid,
		UploadOutline,
		UploadSolid
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
		resetImportDir().then(() =>
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
		await initDfSql();
		openDB();
		await openGraphDb();
		await initFlow();
	});

	onDestroy(async () => {
		// TODO, needs the db to be owned by this view or a backend storage..
		// storeViewPort($viewport.x, $viewport.y, $viewport.zoom);
	});
</script>

<section class="px-8">
	<div class="overview h-full border-2 border-dotted border-slate-500" style="height: 85dvh;">
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
				<SpeedDial
					color="purpleToPink"
					gradient
					defaultClass="end-5 bottom-5"
					placement="left"
					tooltip="none"
					textOutside
				>
					<CirclePlusOutline class="h-5 w-5" slot="icon" />
					<SpeedDialButton
						btnDefaultClass="w-5"
						textOutsideClass="block absolute text-xs font-medium top-full"
						name="Model"
						disabled
					>
						<BrainOutline color="purple" />
					</SpeedDialButton>
					<SpeedDialButton
						btnDefaultClass="w-5"
						textOutsideClass="block absolute text-xs font-medium top-full"
						name="Function"
						disabled
					>
						<FacebookSolid color="purple" />
					</SpeedDialButton>
					<SpeedDialButton
						btnDefaultClass="w-5"
						textOutsideClass="block absolute text-xs font-medium top-full"
						name="Data"
						on:click={() => ($showDataUpload = true)}
					>
						<UploadOutline color="purple" />
					</SpeedDialButton>
					<SpeedDialButton
						btnDefaultClass="w-5"
						textOutsideClass="block absolute text-xs font-medium top-full"
						name="Query"
						on:click={() => addEmptyQueryNode()}
					>
						<DatabaseOutline color="purple" />
					</SpeedDialButton>
				</SpeedDial>
				<SpeedDial
					color="greenToBlue"
					gradient
					defaultClass="mt-2"
					placement="bottom"
					tooltip="none"
					textOutside
				>
					<TruckOutline class="h-5 w-5" slot="icon" />
					<SpeedDialButton btnDefaultClass="w-5" textOutsideClass="block absolute -start-12 top-1/2 text-xs font-medium -translate-y-1/2" name="Publish" disabled>
						<RocketOutline color="green" />
					</SpeedDialButton>
					<SpeedDialButton btnDefaultClass="w-5" textOutsideClass="block absolute -start-12 top-1/2 text-xs font-medium -translate-y-1/2" name="Share" disabled>
						<ShareAllOutline color="green" />
					</SpeedDialButton>
					<SpeedDialButton btnDefaultClass="w-5" textOutsideClass="block absolute -start-12 top-1/2 text-xs font-medium -translate-y-1/2" name="Deploy" disabled>
						<CloudArrowUpOutline color="green" />
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

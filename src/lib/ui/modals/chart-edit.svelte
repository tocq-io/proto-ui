<script lang="ts">
	import { CHART_NODE_TYPE, CHART_TYPE, nodes, showChartEditor } from '$lib/storeUtils';
	import { Alert, Button, Helper, Modal, Radio } from 'flowbite-svelte';
	import ChartView from '$lib/ui/view/chart-view.svelte';
	import type { Node } from '@xyflow/svelte';
	import type { ChartViewTable } from '$lib/storeUtils';
	import { writable, type Writable } from 'svelte/store';
	import { FloppyDiskAltOutline, InfoCircleSolid } from 'flowbite-svelte-icons';
	import { persistChart } from '$lib/crudUtils';
	import { browser } from '$app/environment';

	let chartLocalData: Writable<ChartViewTable> = writable({
		type: CHART_TYPE.Bar,
		y: []
	});
	let nodeId: string;
	let nodeType: string;
	let wrapperId = browser ? self.crypto.randomUUID() : 'init_id';

	async function setTableData(event: Event) {
		let target = <HTMLInputElement>event.target;
		nodeId = target.value;
		nodeType = target.id;
		chartLocalData.update((tblD) => {
			tblD.tableId = target.value;
			return tblD;
		});
	}
	function initDataAndGetLabel(node: Node): string {
		return node.data.name
			? node.data.name.toString()
			: node.data.sql
				? node.data.sql.toString()
				: 'no known type';
	}
	async function saveChart() {
		persistChart($chartLocalData, nodeId, nodeType);
	}
	function unload() {
		chartLocalData.set({ type: CHART_TYPE.Bar });
		nodeId = '';
		nodeType = '';
	}
</script>

<Modal bind:open={$showChartEditor} on:close={() => unload()} autoclose class="min-w-full">
	<div class="grid pt-4 sm:grid-cols-2">
		<div class="w-max">
			<div class="flex">
				<div>
					<span class="text-md font-semibold"><nobr>Chart type:</nobr></span>
				</div>
				<div class="flex gap-3 pl-3">
					<Radio value="bar" bind:group={$chartLocalData.type}
						><span class="text-sm font-normal text-gray-500">Bars</span></Radio
					>
					<Radio value="line" bind:group={$chartLocalData.type}
						><span class="text-sm font-normal text-gray-500">Lines</span></Radio
					>
					<Radio value="bubble" bind:group={$chartLocalData.type} disabled
						><span class="text-sm font-normal text-gray-500"
							><nobr><s>Bubbles</s> &#x1F37E;</nobr></span
						></Radio
					>
				</div>
			</div>
		</div>
		<div class="text-right">
			<Button size="sm" class="h-4/5" on:click={() => saveChart()}
				><FloppyDiskAltOutline />Save</Button
			>
		</div>
		<div class="flex">
			<div class="pr-3"><span class="text-md font-semibold"><nobr>Data table:</nobr></span></div>
			<div class="mt-0.5">
				{#each $nodes as node}
					{#if node.type != CHART_NODE_TYPE}
						<Radio
							value={node.id}
							id={node.type}
							bind:group={$chartLocalData.tableId}
							on:change={(e) => setTableData(e)}
							><span class="text-sm font-normal text-gray-500"
								><nobr>{initDataAndGetLabel(node)}</nobr></span
							></Radio
						>
					{/if}
				{/each}
			</div>
		</div>
	</div>
	<Alert color="green">
		<InfoCircleSolid slot="icon" class="h-5 w-5" />
		<span class="font-medium"
			>Charts selected table, 1st column as x axis, up to 8 additional columns on y axis.</span
		>
	</Alert>
	<hr style="border-top: dotted 1px;" />
	<ChartView {chartLocalData} {wrapperId} />
</Modal>

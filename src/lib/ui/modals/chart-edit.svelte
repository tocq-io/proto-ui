<script lang="ts">
	import { CHART_NODE_TYPE, CHART_TYPE, nodes, showChartEditor, tables } from '$lib/storeUtils';
	import { Button, Modal, Radio } from 'flowbite-svelte';
	import ChartView from '$lib/ui/view/chart-view.svelte';
	import type { Node } from '@xyflow/svelte';
	import type { ChartLocalData } from '$lib/storeUtils';
	import { writable, type Writable } from 'svelte/store';
	import { FloppyDiskAltOutline } from 'flowbite-svelte-icons';
	import { persistChart } from '$lib/crudUtils';
	import type { Table } from '@apache-arrow/ts';
	import { browser } from '$app/environment';

	let chartLocalData: Writable<ChartLocalData> = writable({
		type: CHART_TYPE.Bar,
		y: []
	});
	let nodeId: string;
	let nodeType: string;
	let table: Table | undefined;
	let wrapperId = browser ? self.crypto.randomUUID() : "init_id";

	async function setTableData(event: Event) {
		let target = <HTMLInputElement>event.target;
		nodeId = target.value;
		nodeType = target.id;
		table = $tables.get(target.value);
		chartLocalData.update((tblD) => {
			tblD.dataId = target.value;
			tblD.x = undefined;
			tblD.y = [];
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
		chartLocalData.set({ type: CHART_TYPE.Bar, y: [] });
		nodeId = '';
		nodeType = '';
	}
</script>

<Modal bind:open={$showChartEditor} on:close={() => unload()} autoclose class="min-w-full">
	<div class="grid pt-4 sm:grid-cols-2">
		<div>
			<div class="flex">
				<div>
					<span class="text-md font-semibold">Chart type:</span>
				</div>
				<div class="flex gap-3 pl-3">
					<Radio value="bar" bind:group={$chartLocalData.type}
						><span class="text-sm font-normal text-gray-500">Bars</span></Radio
					>
					<Radio value="line" bind:group={$chartLocalData.type}
						><span class="text-sm font-normal text-gray-500">Lines</span></Radio
					>
					<!--Radio value="bubble" bind:group={$chartLocalData.type}
				><span class="text-sm font-normal text-gray-500">Bubbles &#x1F37E;</span></Radio
			-->
				</div>
			</div>
		</div>
		<div class="text-right">
			<Button size="sm" class="h-4/5" on:click={() => saveChart()}
				><FloppyDiskAltOutline />Save</Button
			>
		</div>
	</div>
	<div class="flex gap-3">
		<span class="text-md font-semibold">Data source:</span>
		{#each $nodes as node}
			{#if node.type != CHART_NODE_TYPE}
				<Radio
					value={node.id}
					id={node.type}
					bind:group={$chartLocalData.dataId}
					on:change={(e) => setTableData(e)}
					><span class="text-sm font-normal text-gray-500">{initDataAndGetLabel(node)}</span></Radio
				>
			{/if}
		{/each}
	</div>
	<div class="-py-4">
		{#if table}
			<div class="mb-1 flex gap-4">
				<span class="text-sm font-semibold">x:</span>
				{#each table.schema.fields as field}
					{#if field.name === $chartLocalData.r || ($chartLocalData.y && $chartLocalData.y?.indexOf(field.name) >= 0)}
						<Radio value={field.name} bind:group={$chartLocalData.x} disabled
							><span class="text-xs font-normal text-gray-500"><nobr>{field.name}</nobr></span
							></Radio
						>
					{:else}
						<Radio value={field.name} bind:group={$chartLocalData.x}
							><span class="text-xs font-normal text-gray-500"><nobr>{field.name}</nobr></span
							></Radio
						>
					{/if}
				{/each}
			</div>
			<div class="flex gap-4">
				<span class="-mt-1 text-sm font-semibold">y:</span>
				{#each table.schema.fields as field}
					{#if field.name === $chartLocalData.x || field.name === $chartLocalData.r}
						<input
							id="default-checkbox"
							type="checkbox"
							bind:group={$chartLocalData.y}
							value={field.name}
							disabled
							class="h-4 w-4 rounded border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-primary-600"
						/>
					{:else}
						<input
							id="default-checkbox"
							type="checkbox"
							bind:group={$chartLocalData.y}
							value={field.name}
							class="h-4 w-4 rounded border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-primary-600"
						/>
					{/if}
					<label
						for="default-checkbox"
						class="font-font-light -ml-2 text-xs text-gray-500 dark:text-gray-300"
						>{field.name}</label
					>
				{/each}
			</div>
			{#if $chartLocalData.type === 'bubble'}
				<div class="mt-1 flex gap-4">
					<span class="text-sm font-semibold">r:</span>
					{#each table.schema.fields as field}
						{#if field.name === $chartLocalData.x || ($chartLocalData.y && $chartLocalData.y.indexOf(field.name) >= 0)}
							<Radio value={field.name} bind:group={$chartLocalData.r} disabled
								><span class="text-xs font-normal text-gray-500"><nobr>{field.name}</nobr></span
								></Radio
							>
						{:else}
							<Radio value={field.name} bind:group={$chartLocalData.r}
								><span class="text-xs font-normal text-gray-500"><nobr>{field.name}</nobr></span
								></Radio
							>
						{/if}
					{/each}
				</div>
			{/if}
		{/if}
	</div>
	<hr style="border-top: dotted 1px;" />
	<ChartView {chartLocalData} {wrapperId} />
</Modal>

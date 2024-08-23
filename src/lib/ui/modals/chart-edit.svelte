<script lang="ts">
	import { DEFAULT_CHART_TYPE, nodes, showChartEditor } from '$lib/storeUtils';
	import { Modal, Radio } from 'flowbite-svelte';
	import ChartView from '$lib/ui/view/chart-view.svelte';
	import type { Node } from '@xyflow/svelte';
	import type { ChartLocalData } from '$lib/storeUtils';
	import { run_sql } from 'proto-query-engine';
	import { tableFromIPC } from '@apache-arrow/ts';
	import { writable, type Writable } from 'svelte/store';

	let chartLocalData: Writable<ChartLocalData> = writable({
		type: DEFAULT_CHART_TYPE,
		y: []
	});
	let sqlStatements = new Map<string, string>();

	async function setTableData(event: Event) {
		let target = <HTMLInputElement>event.target;
		const sql = sqlStatements.get(target.value) || 'SELECT * from world';
		const tbl = await run_sql(sql).then((ipcResult) => {
			return tableFromIPC(ipcResult);
		});
		chartLocalData.update((tblD) => {
			tblD.x = undefined;
			tblD.y = [];
			tblD.table = tbl;
			return tblD;
		});
	}
	function initDataAndGetLabel(node: Node): string {
		if (node.data.name) {
			sqlStatements.set(node.id, 'SELECT * FROM ' + node.data.name.toString());
			return node.data.name.toString();
		} else if (node.data.sql) {
			sqlStatements.set(node.id, node.data.sql.toString());
			return node.data.sql.toString();
		}
		return 'no known type';
	}
	function unload() {
		chartLocalData.set({ type: DEFAULT_CHART_TYPE, y: [] });
		sqlStatements.clear();
	}
</script>

<Modal bind:open={$showChartEditor} on:close={() => unload()} autoclose class="min-w-full">
	<div class="-py-4 flex">
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
	<hr style="border-top: dotted 1px;" />
	<div class="flex gap-3">
		<span class="text-md font-semibold">Data source:</span>
		{#each $nodes as node}
			<Radio value={node.id} bind:group={$chartLocalData.dataId} on:change={(e) => setTableData(e)}
				><span class="text-sm font-normal text-gray-500">{initDataAndGetLabel(node)}</span></Radio
			>
		{/each}
	</div>
	<div class="-py-4">
		{#if $chartLocalData.table}
			<div class="mb-1 flex gap-4">
				<span class="text-sm font-semibold">x:</span>
				{#each $chartLocalData.table.schema.fields as field}
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
				{#each $chartLocalData.table.schema.fields as field}
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
					{#each $chartLocalData.table.schema.fields as field}
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
	<ChartView {chartLocalData} />
</Modal>

<script lang="ts">
	import { DEFAULT_CHART_TYPE, nodes, showChartEditor } from '$lib/storeUtils';
	import { Checkbox, Helper, Input, Modal, Radio } from 'flowbite-svelte';
	import ChartView from '$lib/ui/view/chart-view.svelte';
	import type { Node } from '@xyflow/svelte';
	import type { ChartLocalData, ChartTableData } from '$lib/storeUtils';
	import { run_sql } from 'proto-query-engine';
	import { Table, tableFromIPC } from '@apache-arrow/ts';
	import { writable, type Writable } from 'svelte/store';

	let chartLocalData: Writable<ChartLocalData> = writable({ type: DEFAULT_CHART_TYPE, data: [] });
	let sqlStatements = new Map<string, string>();

	async function getTableData(nodeId: string): Promise<Table> {
		const sql = sqlStatements.get(nodeId) || 'SELECT * from world';
		return run_sql(sql).then((ipcResult) => {
			return tableFromIPC(ipcResult);
		});
	}
	async function getCheckedIds(event: Event) {
		let target = <HTMLInputElement>event.target;
		if (target?.checked) {
			$chartLocalData.data.push({
				id: target?.id,
				name: target?.value,
				table: await getTableData(target?.id)
			});
			$chartLocalData.data = $chartLocalData.data;
		} else {
			$chartLocalData.data = $chartLocalData.data.reduce(
				(p: ChartTableData[], c: ChartTableData) => (c.id !== target?.id && p.push(c), p),
				[]
			);
		}
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
	function getLabel(node: Node): string {
		return node.data.name
			? node.data.name.toString()
			: node.data.sql
				? node.data.sql.toString().substring(0, 25)
				: 'no known type';
	}
    function unload(){
        chartLocalData.set({ type: DEFAULT_CHART_TYPE, data: [] });
    }
</script>

<Modal bind:open={$showChartEditor} on:close={() => unload()} autoclose class="min-w-full">
	<div class="-py-4 flex">
		<div>
			<p class="text-md font-semibold">Select a chart type ></p>
		</div>
		<div class="flex gap-3 pl-3">
			<Radio value="bar" bind:group={$chartLocalData.type}
				><span class="text-sm font-normal text-gray-500">Bars</span></Radio
			>
			<Radio value="line" bind:group={$chartLocalData.type}
				><span class="text-sm font-normal text-gray-500">Lines</span></Radio
			>
			<Radio value="bubble" bind:group={$chartLocalData.type}
				><span class="text-sm font-medium text-gray-500">Bubbles &#x1F37E;</span></Radio
			>
		</div>
	</div>
	<hr style="border-top: dotted 1px;" />
	<div class="flex gap-3">
		<span class="text-sm font-semibold">Data sources ></span>
		{#each $nodes as node}
			<Checkbox id={node.id} value={initDataAndGetLabel(node)} on:change={(e) => getCheckedIds(e)}
				><span class="text-sm font-normal text-gray-500">{getLabel(node)}</span></Checkbox
			>
		{/each}
	</div>
	{#if $chartLocalData.data.length > 0}
		<div class="-py-4">
			{#each $chartLocalData.data as chttl}
				<div class="mb-1 mt-2"><Helper>Configure: {chttl.name}</Helper></div>
				{#if chttl.table}
					<div class="mb-1 flex gap-4">
						<span class="text-sm font-semibold">x:</span>
						{#each chttl.table.schema.fields as field}
							{#if field.name === chttl.y || field.name === chttl.r}
								<Radio value={field.name} bind:group={chttl.x} disabled
									><span class="text-xs font-normal text-gray-500"><nobr>{field.name}</nobr></span
									></Radio
								>
							{:else}
								<Radio value={field.name} bind:group={chttl.x}
									><span class="text-xs font-normal text-gray-500"><nobr>{field.name}</nobr></span
									></Radio
								>
							{/if}
						{/each}
					</div>
					<div class="flex gap-4">
						<span class="text-sm font-semibold">y:</span>
						{#each chttl.table.schema.fields as field}
							{#if field.name === chttl.x || field.name === chttl.r}
								<Radio value={field.name} bind:group={chttl.y} disabled
									><span class="text-xs font-normal text-gray-500"><nobr>{field.name}</nobr></span
									></Radio
								>
							{:else}
								<Radio value={field.name} bind:group={chttl.y}
									><span class="text-xs font-normal text-gray-500"><nobr>{field.name}</nobr></span
									></Radio
								>
							{/if}
						{/each}
					</div>
					{#if $chartLocalData.type === 'bubble'}
						<div class="mt-1 flex gap-4">
							<span class="text-sm font-semibold">r:</span>
							{#each chttl.table.schema.fields as field}
								{#if field.name === chttl.x || field.name === chttl.y}
									<Radio value={field.name} bind:group={chttl.r}
										><span class="text-xs font-normal text-gray-500"><nobr>{field.name}</nobr></span
										></Radio
									>
								{:else}
									<Radio value={field.name} bind:group={chttl.r}
										><span class="text-xs font-normal text-gray-500"><nobr>{field.name}</nobr></span
										></Radio
									>
								{/if}
							{/each}
						</div>
					{/if}
				{/if}
			{/each}
		</div>
	{/if}
	<hr style="border-top: dotted 1px;" />
	<ChartView {chartLocalData} />
</Modal>

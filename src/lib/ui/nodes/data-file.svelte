<script lang="ts">
	import { type DataFileProps } from '$lib/storeUtils';
	import { Handle, Position } from '@xyflow/svelte';
	import { Alert, Button, ButtonGroup } from 'flowbite-svelte';
	import {
		ChartMixedOutline,
		CloseCircleOutline,
		EyeOutline,
		InfoCircleOutline,
		TableRowOutline
	} from 'flowbite-svelte-icons';
	import { deleteDataRecordAndEdges } from '$lib/crudUtils';
	import type { Table } from '@apache-arrow/ts';
	import { onDestroy, onMount } from 'svelte';
	import TableView from '$lib/ui/view/table-view.svelte';
	import { updateDataFile } from '$lib/graphUtils';
	import {
		readable,
		writable,
		type Readable,
		type Unsubscriber,
		type Writable
	} from 'svelte/store';
	import ChartWrapper from '$lib/ui/view/chart-wrapper.svelte';
	import { getArrowTable } from '$lib/arrowSqlUtils';

	type $$Props = DataFileProps;
	$$restProps;

	export let data: $$Props['data'];
	export let id: $$Props['id'];
	let loading = true;
	enum DetailView {
		ViewTable = 1,
		ViewChart = 2,
		ViewSchema = 3,
		ViewBasic = 0
	}
	let table: Readable<Table | undefined>;
	let chartType: Writable<string> = writable($data.chartType);
	let wrapperDivId: string;
	let chartUnsubscribe: Unsubscriber;
	let dataUnsubscribe: Unsubscriber;

	function deleteDataNode() {
		deleteDataRecordAndEdges(id, $data.tableName);
	}
	onDestroy(async () => {
		dataUnsubscribe();
		chartUnsubscribe();
	});
	onMount(async () => {
		wrapperDivId = window.crypto.randomUUID();
		dataUnsubscribe = data.subscribe(
			async (dt) => (table = readable(await getArrowTable("SELECT * FROM '" + dt.tableName + "' LIMIT 50", id)))
		);
		chartUnsubscribe = chartType.subscribe((cht) => {
			$data.chartType = cht;
			if (!loading) updateDataFile($data, id);
		});
		loading = false;
	});
</script>

<div>
	<div class="mb-2 grid sm:grid-cols-2">
		<div class="flex gap-2">
			<Button
				class="mt-0.5 h-6 w-6"
				pill
				size="xs"
				color="primary"
				on:click={() => deleteDataNode()}
				><CloseCircleOutline color="white" size="lg" strokeWidth="3" /></Button
			><span class="text-xl font-semibold">TABLE [{$data.tableName}]</span>
		</div>
		<div class="text-right">
			<ButtonGroup>
				<Button
					size="lg"
					class="h-8 w-8"
					on:click={() => (($data.nodeView = DetailView.ViewBasic), updateDataFile($data, id))}
					><InfoCircleOutline /></Button
				>
				<Button
					size="lg"
					class="h-8 w-8"
					on:click={() => (($data.nodeView = DetailView.ViewSchema), updateDataFile($data, id))}
					><TableRowOutline /></Button
				>
				<Button
					size="lg"
					class="h-8 w-8"
					on:click={() => (($data.nodeView = DetailView.ViewTable), updateDataFile($data, id))}
					><EyeOutline /></Button
				>
				<Button
					size="lg"
					class="h-8 w-8"
					on:click={() => (($data.nodeView = DetailView.ViewChart), updateDataFile($data, id))}
					><ChartMixedOutline /></Button
				>
			</ButtonGroup>
		</div>
	</div>
	<div>
		{#if $data.nodeView === DetailView.ViewSchema && $table}
			<Alert color="light" class="p-2">
				<div class="grid grid-cols-5 gap-1">
					{#each $table.schema.fields as field}
						<nobr>{field}</nobr>
					{/each}
				</div>
			</Alert>
		{:else if $data.nodeView === DetailView.ViewTable}
			<TableView {table} />
		{:else if $data.nodeView === DetailView.ViewChart}
			<ChartWrapper {table} {chartType} {wrapperDivId} />
		{:else}
			<Alert color="light" class="mt-1 p-2">
				<div class="flex gap-1.5 text-xs">
					<span><nobr>[format: {$data.format}]</nobr></span>
					<span><nobr>[size: {$data.size}]<nobr></nobr></nobr></span>
					<span class="w-full text-right">[{id}]</span>
				</div>
			</Alert>
		{/if}
	</div>
</div>
<Handle type="source" position={Position.Bottom} />

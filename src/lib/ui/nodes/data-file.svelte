<script lang="ts">
	import { tables, type DataFileProps } from '$lib/storeUtils';
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
	import { writable, type Unsubscriber, type Writable } from 'svelte/store';
	import ChartWrapper from '$lib/ui/view/chart-wrapper.svelte';

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
	let table: Writable<Table | undefined> = writable($tables.get(id));
	let wrapperDivId: string;
	let unsubscribe: Unsubscriber;

	function deleteDataNode() {
		deleteDataRecordAndEdges(id, $data.tableName);
	}
	onDestroy(async () => {
		unsubscribe();
	});
	onMount(async () => {
		wrapperDivId = window.crypto.randomUUID();
		tables.subscribe((tbl) => {
			table.set(tbl.get(id));
		});
		unsubscribe = data.subscribe((dt) => {
			if (!loading) {
				updateDataFile($data, id);
			}
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
				<Button size="lg" class="h-8 w-8" on:click={() => ($data.nodeView = DetailView.ViewBasic)}
					><InfoCircleOutline /></Button
				>
				<Button size="lg" class="h-8 w-8" on:click={() => ($data.nodeView = DetailView.ViewSchema)}
					><TableRowOutline /></Button
				>
				<Button size="lg" class="h-8 w-8" on:click={() => ($data.nodeView = DetailView.ViewTable)}
					><EyeOutline /></Button
				>
				<Button size="lg" class="h-8 w-8" on:click={() => ($data.nodeView = DetailView.ViewChart)}
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
			<ChartWrapper {table} {data} {wrapperDivId} />
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

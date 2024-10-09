<script lang="ts">
	import { type DataFileProps } from '$lib/storeUtils';
	import { Handle, Position } from '@xyflow/svelte';
	import { Alert, Button, ButtonGroup } from 'flowbite-svelte';
	import {
		CloseCircleSolid,
		EyeOutline,
		InfoCircleOutline,
		TableRowOutline
	} from 'flowbite-svelte-icons';
	import { deleteDataRecordAndEdges } from '$lib/crudUtils';
	import type { Table } from '@apache-arrow/ts';
	import { onDestroy, onMount } from 'svelte';
	import TableView from '$lib/ui/view/table-view.svelte';
	import { updateDataFile } from '$lib/graphUtils';
	import { readable, writable, type Readable, type Unsubscriber } from 'svelte/store';
	import { getArrowTable } from '$lib/dfSqlUtils';

	type $$Props = DataFileProps;
	$$restProps;

	export let data: $$Props['data'];
	export let id: $$Props['id'];
	enum DetailView {
		ViewTable = 1,
		ViewSchema = 2,
		ViewBasic = 0
	}
	let table: Readable<Table | undefined>;
	let total_items: Readable<number>;
	let page = writable(0);
	let dataUnsubscribe: Unsubscriber;
	let pageUnsubscribe: Unsubscriber;

	function deleteDataNode() {
		deleteDataRecordAndEdges(id, $data.tableName);
	}
	onDestroy(async () => {
		dataUnsubscribe();
		pageUnsubscribe();
	});
	onMount(async () => {
		dataUnsubscribe = data.subscribe(async (dt) => {
			total_items = readable(
				await getArrowTable("SELECT count(1) as total FROM '" + dt.tableName + "'").then((r) =>
					Number(r?.toArray()[0]['total'])
				)
			);
		});
		pageUnsubscribe = page.subscribe(async (pg) => {
			table = readable(
				await getArrowTable("SELECT * FROM '" + $data.tableName + "' LIMIT 10 OFFSET " + pg)
			);
		});
	});
</script>

<div>
	<div class="mb-2 grid sm:grid-cols-2">
		<div class="flex gap-2">
			<Button class="mt-0.5 h-6 w-6" pill size="xs" color="purple" on:click={deleteDataNode}
				><CloseCircleSolid color="white" size="xl" /></Button
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
					><EyeOutline /></Button
				>
				<Button
					size="lg"
					class="h-8 w-8"
					on:click={() => (($data.nodeView = DetailView.ViewTable), updateDataFile($data, id))}
					><TableRowOutline /></Button
				>
			</ButtonGroup>
		</div>
	</div>
	<div>
		{#if $data.nodeView === DetailView.ViewSchema && $table}
			<Alert color="light" class="p-2">
				<span class="ml-1 mb-1 text-lg font-semibold">Schema</span>
				<div class="grid w-max grid-cols-5 gap-1">
					{#each $table.schema.fields as field}
						<div class="grid grid-cols-2 border-2 border-dashed">
							<span class="ml-2 max-w-48">{field.name}</span><span class="mr-2 text-right"
								>{field.type}</span
							>
						</div>
					{/each}
				</div>
			</Alert>
		{:else if $data.nodeView === DetailView.ViewTable}
			<TableView {table} {total_items} {page} />
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

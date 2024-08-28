<script lang="ts">
	import { tables, type DataFileProps } from '$lib/storeUtils';
	import { Handle, Position } from '@xyflow/svelte';
	import { Alert, Button, ButtonGroup } from 'flowbite-svelte';
	import { ChartMixedOutline, CloseCircleOutline, EyeOutline } from 'flowbite-svelte-icons';
	import { deleteDataRecordAndEdges } from '$lib/crudUtils';
	import { addChart, setPreviewData } from '$lib/nodesUtils';
	import type { Table } from '@apache-arrow/ts';
	import { onMount } from 'svelte';

	type $$Props = DataFileProps;
	$$restProps;

	export let data: $$Props['data'];
	export let id: $$Props['id'];
	export let type: $$Props['type'];
	let myTable: Table | undefined;

	async function deleteDataNode() {
		await deleteDataRecordAndEdges(id, data.name);
	}
	onMount(async () => {
		myTable = $tables.get(id);
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
			><span class="text-xl font-semibold">TABLE [{data.name}]</span>
		</div>
		<div class="text-right">
			<ButtonGroup>
				<Button size="lg" class="h-8 w-8" on:click={() => setPreviewData(id)}><EyeOutline /></Button
				>
				<Button
					size="lg"
					class="h-8 w-8"
					on:click={() => addChart(id, type)}
					disabled={id === 'empty_query'}><ChartMixedOutline /></Button
				>
			</ButtonGroup>
		</div>
	</div>
	<div>
		{#if myTable}
			<Alert color="light" class="p-2">
				<div class="grid grid-cols-6 gap-0.5">
					{#each myTable.schema.fields as field}
						<nobr>{field}</nobr>
					{/each}
				</div>
			</Alert>
		{/if}
	</div>
	<Alert color="light" class="p-2 mt-1">
		<div class="mt-1 grid sm:grid-cols-2">
			<span class="text-xs">[format: {data.format}]</span>
			<span class="text-right text-xs">[size: {data.size}]</span>
		</div>
		<div>
			<span class="text-xs">[{id}]</span>
		</div>
	</Alert>
</div>
<Handle type="source" position={Position.Bottom} />

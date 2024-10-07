<script lang="ts">
	import { Handle, Position } from '@xyflow/svelte';
	import { A, Alert, Button, ButtonGroup, Span } from 'flowbite-svelte';
	import {
		ChartMixedOutline,
		CloseCircleSolid,
		EditOutline,
		FloppyDiskOutline,
		InfoCircleOutline,
		TableRowOutline
	} from 'flowbite-svelte-icons';
	import { type QueryProps } from '$lib/storeUtils';
	import SqlEditor from '$lib/ui/editor/sql-editor.svelte';
	import JsEditor from '$lib/ui/editor/js-editor.svelte';
	import { deleteQuery, persistQuery, updateQuery } from '$lib/crudUtils';
	import { readable, writable, type Readable, type Unsubscriber } from 'svelte/store';
	import TableView from '$lib/ui/view/table-view.svelte';
	import { onDestroy, onMount } from 'svelte';
	import { updateDfSqlFile } from '$lib/graphUtils';
	import { getArrowTable } from '$lib/dfSqlUtils';
	import type { Table } from '@apache-arrow/ts';
	import ChartView from '$lib/ui/view/chart-view.svelte';

	type $$Props = QueryProps;
	$$restProps;

	export let data: $$Props['data'];
	export let id: $$Props['id'];

	let sqlEditorElementId = window ? window.crypto.randomUUID() : '';
	let jsEditorElementId = window ? window.crypto.randomUUID() : '';
	let chartViewElementId: string = window ? window.crypto.randomUUID() : '';
	enum DetailView {
		ViewTable = 1,
		ViewChart = 2,
		ViewChartEditor = 3,
		ViewBasic = 0
	}
	let sqlText = writable($data.statement);
	let jsText = writable($data.chartConfig);
	let table: Readable<Table | undefined>;
	let dataUnsubscribe: Unsubscriber;

	function deleteSqlNode() {
		deleteQuery(id);
	}
	async function saveSqlNode() {
		$data.statement = $sqlText;
		if (id === 'empty_query') {
			persistQuery($data);
		} else {
			updateQuery($data, id);
		}
		table = readable(await getArrowTable($sqlText));
	}
	async function safeState() {
		if ($data.nodeView === DetailView.ViewChart || $data.nodeView === DetailView.ViewTable) {
			if ($data.statement !== $sqlText) {
				table = readable(await getArrowTable($sqlText));
				$data.statement = $sqlText;
			} else if ($data.chartConfig !== $jsText) {
				$data.chartConfig = $jsText;
			}
		}
		updateDfSqlFile($data, id);
	}

	function isEmpty() {
		return id === 'empty_query';
	}

	onDestroy(async () => {
		dataUnsubscribe();
	});
	onMount(async () => {
		dataUnsubscribe = data.subscribe(async (dt) => {
			if (dt.statement) {
				table = readable(await getArrowTable(dt.statement));
			}
		});
	});
</script>

<Handle type="target" position={Position.Top} />
<div class="min-w-192">
	<div class="mb-2 grid sm:grid-cols-2">
		<div class="flex gap-2">
			<Button class="mt-0.5 h-6 w-6" pill size="xs" color="purple" on:click={() => deleteSqlNode()}
				><CloseCircleSolid color="white" size="xl" /></Button
			><span class="text-xl font-semibold">QUERY</span>
		</div>
		<div class="text-right">
			<ButtonGroup>
				<Button
					size="lg"
					class="h-8 w-8"
					on:click={() => (($data.nodeView = DetailView.ViewBasic), safeState())}
					><InfoCircleOutline /></Button
				>
				<Button
					size="lg"
					class="h-8 w-8"
					on:click={() => (($data.nodeView = DetailView.ViewTable), safeState())}
					disabled={isEmpty()}><TableRowOutline /></Button
				>
				<Button
					size="lg"
					class="h-8 w-8"
					on:click={() => (($data.nodeView = DetailView.ViewChart), safeState())}
					disabled={isEmpty()}><ChartMixedOutline /></Button
				>
				<Button
					size="lg"
					class="h-8 w-8"
					on:click={() => (($data.nodeView = DetailView.ViewChartEditor), safeState())}
					disabled={isEmpty()}><EditOutline /></Button
				>
				<Button size="lg" class="h-8 w-8" on:click={() => saveSqlNode()}
					><FloppyDiskOutline /></Button
				>
			</ButtonGroup>
		</div>
	</div>

	<Alert color="blue" class="mt-2 py-2">
		<SqlEditor {sqlText} {sqlEditorElementId} />
	</Alert>
	{#if $data.nodeView === DetailView.ViewTable && !isEmpty()}
		<TableView {table} />
	{:else if $data.nodeView === DetailView.ViewChartEditor && !isEmpty()}
		<Alert color="red" class="mt-4 py-2">
			<JsEditor {jsText} {jsEditorElementId} />
		</Alert>
		<div class="ml-1 mt-2 text-sm">
			<A
				color="text-blue-400"
				href="https://www.chartjs.org/docs/latest/configuration/"
				target="_blank">Chart.js configuration</A
			>
			using the underlying
			<A
				color="text-blue-400"
				href="https://arrow.apache.org/docs/js/classes/Arrow_dom.Table.html"
				target="_blank">Arrow table</A
			>. The $table is stored in memory within this context.
		</div>
	{:else if $data.nodeView === DetailView.ViewChart && !isEmpty()}
		<ChartView {jsText} {table} {chartViewElementId} />
	{:else}
		<Alert color="light" class="mt-1 p-2">
			<div class="flex gap-0.5 text-xs">
				<span><nobr>[format: {$data.format}]</nobr></span>
				<span class="w-full text-right">[{id}]</span>
			</div>
		</Alert>
	{/if}
</div>
<Handle type="source" position={Position.Bottom} />

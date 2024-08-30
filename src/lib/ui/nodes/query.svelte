<script lang="ts">
	import { Handle, Position } from '@xyflow/svelte';
	import { Alert, Button, ButtonGroup } from 'flowbite-svelte';
	import {
		ChartMixedOutline,
		CloseCircleOutline,
		EditOutline,
		EyeOutline,
		FloppyDiskOutline,
		InfoCircleOutline
	} from 'flowbite-svelte-icons';
	import { tables, type QueryProps } from '$lib/storeUtils';
	import CodeEditor from '$lib/ui/editor/sql-editor.svelte';
	import { deleteQuery, persistQuery, updateQuery } from '$lib/crudUtils';
	import { writable, type Unsubscriber, type Writable } from 'svelte/store';
	import TableView from '$lib/ui/view/table-view.svelte';
	import { onDestroy, onMount } from 'svelte';
	import { updateDfSqlFile } from '$lib/graphUtils';
	import { updateArrowTables } from '$lib/arrowSqlUtils';
	import { stringHash } from '$lib/signUtils';
	import type { Table } from '@apache-arrow/ts';
	import ChartWrapper from '$lib/ui/view/chart-wrapper.svelte';

	type $$Props = QueryProps;
	$$restProps;

	export let data: $$Props['data'];
	export let id: $$Props['id'];
	let editorElementId = 'init_eid';
	let wrapperDivId: string;
	enum DetailView {
		ViewTable = 1,
		ViewChart = 2,
		ViewEditor = 3,
		ViewBasic = 0
	}
	let loading = true;
	let codeText = writable($data.statement);
	let table: Writable<Table | undefined> = writable($tables.get(id));
	let tableUnsubscribe: Unsubscriber;
	let dataUnsubscribe: Unsubscriber;

	function deleteSqlNode() {
		deleteQuery(id);
	}
	function saveSqlNode() {
		$data.statement = $codeText;
		if (id === 'empty_query') {
			persistQuery($data);
		} else {
			updateQuery($data, id);
		}
	}

	function isEmpty() {
		return id === 'empty_query';
	}

	onDestroy(async () => {
		tableUnsubscribe();
		dataUnsubscribe();
	});
	onMount(async () => {
		wrapperDivId = window.crypto.randomUUID();
		editorElementId = self.crypto.randomUUID();
		tableUnsubscribe = tables.subscribe((tbl) => {
			table.set(tbl.get(id));
		});
		dataUnsubscribe = data.subscribe(async (dt) => {
			if (!loading && !isEmpty()) {
				if ($data.nodeView === DetailView.ViewChart || $data.nodeView === DetailView.ViewTable) {
					if ((await stringHash(dt.statement)) !== (await stringHash($codeText))) {
						updateArrowTables($codeText, id);
						dt.statement = $codeText;
					}
				}
				updateDfSqlFile(dt, id);
			}
		});
		loading = false;
	});
</script>

<Handle type="target" position={Position.Top} />
<div>
	<div class="mb-2 grid sm:grid-cols-2">
		<div class="flex gap-2">
			<Button class="mt-0.5 h-6 w-6" pill size="xs" color="primary" on:click={() => deleteSqlNode()}
				><CloseCircleOutline color="white" size="lg" strokeWidth="3" /></Button
			><span class="text-xl font-semibold">DF Query</span>
		</div>
		<div class="text-right">
			<ButtonGroup>
				<Button size="lg" class="h-8 w-8" on:click={() => ($data.nodeView = DetailView.ViewBasic)}
					><InfoCircleOutline /></Button
				>
				<Button
					size="lg"
					class="h-8 w-8"
					on:click={() => ($data.nodeView = DetailView.ViewTable)}
					disabled={isEmpty()}><EyeOutline /></Button
				>
				<Button
					size="lg"
					class="h-8 w-8"
					on:click={() => ($data.nodeView = DetailView.ViewChart)}
					disabled={isEmpty()}><ChartMixedOutline /></Button
				>
				<Button size="lg" class="h-8 w-8" on:click={() => ($data.nodeView = DetailView.ViewEditor)}
					><EditOutline /></Button
				>
				<Button size="lg" class="h-8 w-8" on:click={() => saveSqlNode()}
					><FloppyDiskOutline /></Button
				>
			</ButtonGroup>
		</div>
	</div>
	{#if $data.nodeView === DetailView.ViewEditor}
		<Alert color="blue" class="py-2">
			<CodeEditor {codeText} {editorElementId} />
		</Alert>
	{:else if $data.nodeView === DetailView.ViewTable && !isEmpty()}
		<TableView {table} />
	{:else if $data.nodeView === DetailView.ViewChart && !isEmpty()}
		<ChartWrapper {table} {data} {wrapperDivId} />
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

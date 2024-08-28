<script lang="ts">
	import { Handle, Position } from '@xyflow/svelte';
	import { Button, ButtonGroup } from 'flowbite-svelte';
	import {
		ChartMixedOutline,
		CloseCircleOutline,
		EyeOutline,
		FloppyDiskAltOutline
	} from 'flowbite-svelte-icons';
	import { CHART_TYPE, type ChartViewTable, type QueryProps, previewTable } from '$lib/storeUtils';
	import CodeEditor from '$lib/ui/editor/sql-editor.svelte';
	import { deleteQuery, persistChart, persistQuery, updateQuery } from '$lib/crudUtils';
	import { writable } from 'svelte/store';
	import { browser } from '$app/environment';
	import { getTables } from '$lib/arrowSqlUtils';
	import { run_sql } from 'proto-query-engine';
	import { tableFromIPC } from '@apache-arrow/ts';
	import type { FrameColor } from 'flowbite-svelte/Frame.svelte';

	type $$Props = QueryProps;
	$$restProps;

	export let data: $$Props['data'];
	export let id: $$Props['id'];
	export let type: $$Props['type'];
	let codeText = writable(data.sql);
	let editorElementId = browser ? self.crypto.randomUUID() : 'init_id';

	let dbResult = '...';
	let alertColor: FrameColor = 'green';

	async function showSql() {
		if ($codeText) {
			run_sql($codeText)
				.then((ipcResult) => {
					const tbl = tableFromIPC(ipcResult);
					const result = tbl.toString();
					dbResult = result.length > 1024 ? result.substring(0, 1024) + ' ... ... ...' : result;
					alertColor = 'green';
				})
				.catch((e) => {
					dbResult = e.message;
					alertColor = 'red';
				});
		}
	}

	async function setPreviewData() {
		//TODO save before showing
		$previewTable.tableId = id;
		$previewTable.view = true;
	}
	async function deleteSqlNode() {
		deleteQuery(id);
	}
	async function addChart() {
		// todo save before saving
		let chartLocalData: ChartViewTable = {
			type: CHART_TYPE.Bar,
			tableId: id
		};
		persistChart(chartLocalData, type);
	}
	async function saveSqlNode() {
		getTables($codeText).then((tableIds) => persistQuery($codeText, tableIds));
	}
	async function updateSqlNode() {
		// todo show possible error message
		getTables($codeText).then((tableIds) => updateQuery($codeText, tableIds, id));
	}
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
				<Button size="lg" class="h-8 w-8" on:click={() => setPreviewData()}><EyeOutline /></Button>
				<Button size="lg" class="h-8 w-8" on:click={() => addChart()}><ChartMixedOutline /></Button>
				{#if id === 'empty_query'}
					<Button size="lg" class="h-8 w-8" on:click={() => saveSqlNode()}
						><FloppyDiskAltOutline /></Button
					>
				{:else}
					<Button size="lg" class="h-8 w-8" on:click={() => updateSqlNode()}
						><FloppyDiskAltOutline /></Button
					>
				{/if}
			</ButtonGroup>
		</div>
	</div>
	<div class="py-3">
		<CodeEditor {codeText} {editorElementId} />
	</div>
	<!--hr />
	<Alert color={alertColor}>
		<div class="flex items-center gap-3">
			<BullhornOutline class="h-5 w-5" />
			<span class="text-lg font-medium">Result preview</span>
		</div>
		<p class="mb-4 mt-2 text-sm">{dbResult}</p>
	</Alert-->
	<div class="grid pt-1.5 sm:grid-cols-2">
		<p class="text-xs">[format: {data.format}]</p>
		<p class="text-right text-xs">[{id}]</p>
	</div>
</div>
<Handle type="source" position={Position.Bottom} />

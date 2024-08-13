<script lang="ts">
		import type { PreviewTable, SqlEdit } from '$lib/queryUtils';
	import { getDataFile } from '$lib/graphUtils';
	import { tableFromIPC } from '@apache-arrow/ts';
	import { Handle, Position, type NodeProps } from '@xyflow/svelte';
	import { Button } from 'flowbite-svelte';
	import { EditOutline, TableRowOutline } from 'flowbite-svelte-icons';
	import { load_csv, delete_table, run_sql, has_table } from 'proto-query-engine';
	import type { Writable } from 'svelte/store';

	type $$Props = NodeProps;
	$$restProps;

	export let data: $$Props['data'];
	export let id: $$Props['id'];
	let sql = <string>data.sql;
	let tableIds = <string[]>data.tableIds;
	let format = <string>data.format;
	let previewData = <Writable<PreviewTable>>data.view;
	let sqlEditControl = <Writable<SqlEdit>>data.sqlEditControl;

	async function setPreviewData() {
		const notHadTables = new Map<string, string>();
		for (const tableId of tableIds) {
			const tableName = await getDataFile(tableId);
			const hasTable = await has_table(tableName.fileName);
			if (!hasTable) {
				await load_csv(tableId, tableName.fileName);
				notHadTables.set(tableId, tableName.fileName);
			}
		}
		if (!sql.toUpperCase().includes('LIMIT 10')) {
			sql += ' LIMIT 10';
		}
		await run_sql(sql).then((ipcResult) => {
			$previewData.table = tableFromIPC(ipcResult);
			console.log($previewData.table.schema);
			$previewData.view = true;
		});

		for (const [tableId, tableName] of notHadTables) {
			delete_table(tableId, tableName);
		}
	}
	async function showEditView() {
		sqlEditControl.set({
			view: true,
			sql: sql
		});
	}
</script>

<Handle type="target" position={Position.Top} />
<div>
	<div class="-mb-2 grid sm:grid-cols-2">
		<p>
			<strong>DF Query</strong>
		</p>
		<div class="text-right">
			<Button class="h-3/5 w-1/3" on:click={() => setPreviewData()}
				><TableRowOutline /><span class="pl-1.5 text-sm">Results</span></Button
			>
			<Button class="h-3/5 w-1/3" on:click={() => showEditView()}
				><EditOutline /><span class="pl-1.5 text-sm">Edit</span></Button
			>
		</div>
	</div>
	<hr />
	<div class="py-3">{sql}</div>
	<hr />
	<div class="grid pt-1.5 sm:grid-cols-2">
		<p class="text-xs">[format: {format}]</p>
		<p class="text-right text-xs">[{id}]</p>
	</div>
</div>
<Handle type="source" position={Position.Bottom} />

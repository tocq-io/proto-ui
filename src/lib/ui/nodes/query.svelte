<script lang="ts">
	import { tableFromIPC } from '@apache-arrow/ts';
	import { Handle, Position, useHandleConnections } from '@xyflow/svelte';
	import { Button } from 'flowbite-svelte';
	import { EditOutline, TableRowOutline } from 'flowbite-svelte-icons';
	import { load_csv, delete_table, run_sql, has_table } from 'proto-query-engine';
	import {
		type DataFileNode,
		type QueryProps,
		isDataFileNode,
		nodes,
		previewTable,
		sqlEditControl
	} from '$lib/storeUtils';
	import { deleteAllQueryToData, deleteQueryToData, linkQueryToData } from '$lib/graphUtils';
	import type { HandleConnection } from '@xyflow/system';

	type $$Props = QueryProps;
	$$restProps;

	export let data: $$Props['data'];
	export let id: $$Props['id'];

	const connections = useHandleConnections({ nodeId: id, type: 'target' });
	let initPhase = true;
	let edgeTables = new Set<string>();

	async function setPreviewData() {
		const notHadTables = new Map<string, string>();
		for (const node of $nodes) {
			if (isDataFileNode(node)) {
				const dfNode = <DataFileNode>node;
				const hasTable = await has_table(dfNode.data.name);
				if (!hasTable) {
					await load_csv(dfNode.id, dfNode.data.name);
					notHadTables.set(dfNode.id, dfNode.data.name);
				}
			}
		}
		await run_sql(data.sql).then((ipcResult) => {
			$previewTable.table = tableFromIPC(ipcResult);
			$previewTable.view = true;
		});

		for (const [tableId, tableName] of notHadTables) {
			delete_table(tableId, tableName);
		}
	}
	async function showEditView() {
		sqlEditControl.set({
			view: true,
			done: false,
			sql: data.sql,
			queryId: id,
			edgeTables: edgeTables
		});
	}

	async function handleChanges(cts: HandleConnection[]) {
		if ($sqlEditControl.done) {
			edgeTables = $sqlEditControl.edgeTables;
			if (cts.length > 0) {
				if (edgeTables.size == 0) {
					for (const connection of cts) {
						edgeTables.add(connection.source);
						if (!initPhase) {
							linkQueryToData(connection.source, id);
						}
					}
				} else {
					let deletableTables = edgeTables;
					edgeTables = new Set<string>();
					for (const connection of cts) {
						if (deletableTables.has(connection.source)) {
							deletableTables.delete(connection.source);
						} else {
							linkQueryToData(connection.source, id);
						}
						edgeTables.add(connection.source);
					}
					for (const table of deletableTables) {
						deleteQueryToData(table, id);
					}
				}
			} else if (edgeTables.size > 0) {
				deleteAllQueryToData(id);
				edgeTables = new Set<string>();
			}
			initPhase = false;
		}
	}

	$: handleChanges($connections);
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
	<div class="py-3">{data.sql}</div>
	<hr />
	<div class="grid pt-1.5 sm:grid-cols-2">
		<p class="text-xs">[format: {data.format}]</p>
		<p class="text-right text-xs">[{id}]</p>
	</div>
</div>

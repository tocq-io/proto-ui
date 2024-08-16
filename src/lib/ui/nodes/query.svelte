<script lang="ts">
	import { tableFromIPC } from '@apache-arrow/ts';
	import { Handle, Position, useHandleConnections } from '@xyflow/svelte';
	import { Button } from 'flowbite-svelte';
	import { CloseCircleOutline, EditOutline, TableRowOutline } from 'flowbite-svelte-icons';
	import { load_csv, delete_table, run_sql, has_table } from 'proto-query-engine';
	import {
		type DataFileNode,
		type QueryProps,
		isDataFileNode,
		nodes,
		previewTable,
		sqlEditControl
	} from '$lib/storeUtils';
	import {
		deleteAllQueryToData,
		deleteQueryToData,
		getEdgeQueryToData,
		linkQueryToData
	} from '$lib/graphUtils';
	import type { HandleConnection } from '@xyflow/system';
	import { deleteQuery } from '$lib/queryUtils';

	type $$Props = QueryProps;
	$$restProps;

	export let data: $$Props['data'];
	export let id: $$Props['id'];

	const connections = useHandleConnections({ nodeId: id, type: 'target' });

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
			queryId: id
		});
	}
	async function deleteSqlNode() {
		$sqlEditControl.done = false;
		await deleteQuery(id).then(() => ($sqlEditControl.done = true));
	}
	async function getEdges(): Promise<Set<string>> {
		return getEdgeQueryToData(id).then((existingEdges) => {
			const currentTables = new Set<string>();
			for (const recId of existingEdges.out) {
				currentTables.add(recId.id.toString());
			}
			return currentTables;
		});
	}

	async function handleChanges(cts: HandleConnection[]) {
		// skip while the edit view is open
		if ($sqlEditControl.done) {
			let currentTables = await getEdges();
			if (cts.length > 0) {
				if (currentTables.size == 0) {
					for (const connection of cts) {
						linkQueryToData(connection.source, id);
					}
				} else {
					for (const connection of cts) {
						if (!currentTables.has(connection.source)) {
							linkQueryToData(connection.source, id);
						}
						currentTables.delete(connection.source);
					}
					for (const table of currentTables) {
						deleteQueryToData(table, id);
					}
				}
			} else if (currentTables.size > 0) {
				deleteAllQueryToData(id);
				currentTables = new Set<string>();
			}
		}
	}

	$: handleChanges($connections);
</script>

<Handle type="target" position={Position.Top} />
<div>
	<div class="-mb-2 grid sm:grid-cols-2">
		<div class="flex gap-2">
			<Button class="h-6 w-6 mt-0.5" pill size="xs" color="primary" on:click={() => deleteSqlNode()}
				><CloseCircleOutline color="white" size="lg" strokeWidth="3" /></Button
			><span class="text-xl font-semibold">DF Query</span>
		</div>
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

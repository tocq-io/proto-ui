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
	import { linkQueryToData } from '$lib/graphUtils';

	type $$Props = QueryProps;
	$$restProps;

	export let data: $$Props['data'];
	export let id: $$Props['id'];

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
			sql: data.sql,
			queryId: id
		});
	}

	// TODO needs check which connection already exists.. another time
	// const connections = useHandleConnections({ nodeId: id, type: 'target' });
 
	// $: {
	// 	// This will be called whenever connections change
	// 	// for the target handle in the node with id 'node-id'
	// 	console.log($connections);
	// 	if ($connections.length > 0) {
	// 		linkQueryToData($connections[0].source, $connections[0].target);
	// 	}
	// }
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

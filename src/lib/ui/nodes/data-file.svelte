<script lang="ts">
	import { type DataFileProps, previewTable, sqlEditControl } from '$lib/storeUtils';
	import { Handle, Position } from '@xyflow/svelte';
	import { Button } from 'flowbite-svelte';
	import { CloseCircleOutline, TableRowOutline } from 'flowbite-svelte-icons';
	import { load_csv, delete_table, run_sql, has_table } from 'proto-query-engine';
	import { tableFromIPC } from '@apache-arrow/ts';
	import { deleteDataRecordAndEdges } from '$lib/queryUtils';

	type $$Props = DataFileProps;
	$$restProps;

	export let data: $$Props['data'];
	export let id: $$Props['id'];

	async function deleteDataNode() {
		$sqlEditControl.done = false;
		await deleteDataRecordAndEdges(id).then(() => ($sqlEditControl.done = true));
	}

	async function setPreviewData() {
		const sql = `SELECT * FROM ${data.name} LIMIT 10`;
		if (await has_table(data.name)) {
			run_sql(sql).then((ipcResult) => {
				$previewTable.table = tableFromIPC(ipcResult);
				$previewTable.view = true;
			});
		} else {
			load_csv(id, data.name).then(() =>
				run_sql(sql)
					.then((ipcResult) => {
						$previewTable.table = tableFromIPC(ipcResult);
						$previewTable.view = true;
					})
					.then(() => delete_table(id, data.name))
			);
		}
	}
</script>

<div>
	<div class="-mb-2 grid sm:grid-cols-2">
		<div class="flex gap-2">
			<Button class="h-6 w-6 mt-0.5" pill size="xs" color="primary" on:click={() => deleteDataNode()}
				><CloseCircleOutline color="white" size="lg" strokeWidth="3" /></Button
			><span class="text-xl font-semibold">TABLE [{data.name}]</span>
		</div>
		<div class="text-right">
			<Button class="h-3/5 w-1/2" on:click={() => setPreviewData()}
				><TableRowOutline /><span class="pl-1.5 text-sm">View</span></Button
			>
		</div>
	</div>
	<hr />
	<div class="grid sm:grid-cols-2 mt-1">
		<span class="text-xs">[format: {data.format}]</span>
		<span class="text-xs text-right">[size: {data.size}]</span>
	</div>
	<div>
		<span class="text-xs">[{id}]</span>
	</div>
</div>
<Handle type="source" position={Position.Bottom} />

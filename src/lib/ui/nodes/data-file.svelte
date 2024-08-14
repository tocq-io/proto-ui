<script lang="ts">
	import { type DataFileProps } from '$lib/flowUtils';
	import { Handle, Position, type NodeProps } from '@xyflow/svelte';
	import { Button } from 'flowbite-svelte';
	import { TableRowOutline } from 'flowbite-svelte-icons';
	import { load_csv, delete_table, run_sql, has_table } from 'proto-query-engine';
	import { tableFromIPC } from '@apache-arrow/ts';

	type $$Props = DataFileProps;
	$$restProps;

	export let data: $$Props['data'];
	export let id: $$Props['id'];
	let previewData = data.dataView;

	async function setPreviewData() {
		const sql = `SELECT * FROM ${data.name} LIMIT 10`;
		if (await has_table(data.name)) {
			run_sql(sql).then((ipcResult) => {
				$previewData.table = tableFromIPC(ipcResult);
				console.log($previewData.table.schema);
				$previewData.view = true;
			});
		} else {
			load_csv(id, data.name).then(() =>
				run_sql(sql)
					.then((ipcResult) => {
						$previewData.table = tableFromIPC(ipcResult);
						console.log($previewData.table.schema);
						$previewData.view = true;
					})
					.then(() => delete_table(id, data.name))
			);
		}
	}
</script>

<Handle type="target" position={Position.Top} />
<div>
	<div class="-mb-2 grid sm:grid-cols-2">
		<div>
			<strong>TABLE [{data.name}] </strong>
		</div>
		<div class="text-right">
			<Button class="h-3/5 w-1/2" on:click={() => setPreviewData()}
				><TableRowOutline /><span class="pl-1.5 text-sm">View</span></Button
			>
		</div>
	</div>
	<hr />
	<div>
		<span class="text-xs">[format: {data.format}] [size: {data.size}]</span>
	</div>
	<div>
		<span class="text-xs">[{id}]</span>
	</div>
</div>
<Handle type="source" position={Position.Bottom} />

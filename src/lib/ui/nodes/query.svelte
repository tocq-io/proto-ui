<script lang="ts">
	import { Handle, Position } from '@xyflow/svelte';
	import { Button } from 'flowbite-svelte';
	import { CloseCircleOutline, EditOutline, TableRowOutline } from 'flowbite-svelte-icons';
	import { type QueryProps, previewTable, sqlEditControl } from '$lib/storeUtils';
	import { deleteQuery } from '$lib/crudUtils';

	type $$Props = QueryProps;
	$$restProps;

	export let data: $$Props['data'];
	export let id: $$Props['id'];

	async function setPreviewData() {
		$previewTable.tableId = id;
		$previewTable.view = true;
	}
	async function showEditView() {
		sqlEditControl.set({
			view: true,
			sql: data.sql,
			queryId: id
		});
	}
	async function deleteSqlNode() {
		deleteQuery(id);
	}
</script>

<Handle type="target" position={Position.Top} />
<div>
	<div class="-mb-2 grid sm:grid-cols-2">
		<div class="flex gap-2">
			<Button class="mt-0.5 h-6 w-6" pill size="xs" color="primary" on:click={() => deleteSqlNode()}
				><CloseCircleOutline color="white" size="lg" strokeWidth="3" /></Button
			><span class="text-xl font-semibold">DF Query</span>
		</div>
		<div class="text-right">
			<Button class="h-3/5 w-1/3" on:click={() => setPreviewData()}
				><TableRowOutline /><span class="pl-1.5 text-sm">Peek</span></Button
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
<Handle type="source" position={Position.Bottom} />
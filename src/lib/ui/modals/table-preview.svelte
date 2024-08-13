<script lang="ts">
	import {
		Modal,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import { writable, type Writable } from 'svelte/store';
	import { Table as ArrowTable, tableFromIPC } from '@apache-arrow/ts';
	import { load_csv, delete_table, run_sql } from 'proto-query-engine';
	import type { PreviewData } from '$lib/flowUtils';
	import { valueToString } from '@apache-arrow/ts/util/pretty';

	export let previewData: Writable<PreviewData>;
	let table: Writable<ArrowTable>;

	previewData.subscribe(() => {
		if ($previewData.view) {
			const sql = `SELECT * FROM ${$previewData.name} LIMIT 10`;
			load_csv($previewData.id, $previewData.name).then(() =>
				run_sql(sql).then((ipcResult) => {
					table = writable(tableFromIPC(ipcResult));
					console.log($table.schema);
				})
			);
		} else if ($previewData.id && $previewData.name) {
			delete_table($previewData.id, $previewData.name);
		}
	});
</script>

<Modal bind:open={$previewData.view} class="text-xs">
	<div class="pt-4">
		{#if $table}
			<Table>
				<TableHead>
					{#each $table.schema.fields as field}
						<TableHeadCell padding="px-2 py-1 text-center" scope="col"
							><nobr>{field.name} ({field.type})</nobr></TableHeadCell
						>
					{/each}
				</TableHead>
				<TableBody>
					{#each $table.data as line}
						<TableBodyRow>
							{#each line.children as child}
								<TableBodyCell tdClass="px-2 py-1 text-center"
									>{valueToString(child.values[0])}</TableBodyCell
								>
							{/each}
						</TableBodyRow>
					{/each}
				</TableBody>
			</Table>
		{/if}
	</div>
	<div>
		<span class="text-xs">[first 10 lines]</span>
	</div>
</Modal>

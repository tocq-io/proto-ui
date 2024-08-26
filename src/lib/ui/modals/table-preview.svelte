<script lang="ts">
	import {
		Modal,
		Table as ViewTable,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import { previewTable, tables } from '$lib/storeUtils';
	import type { Table } from '@apache-arrow/ts';

	let viewTable: any[] = [];
	let table: Table | undefined;

	previewTable.subscribe((prvw) => {
		viewTable = [];
		if (prvw.tableId) {
			let maxLength = 10;
			table = $tables.get(prvw.tableId);
			if (table) {
				for (const row of table.toArray()) {
					let rowArr = [];
					for (const value of row.toArray()) {
						rowArr.push(value);
					}
					viewTable.push(rowArr);
					if (--maxLength === 0) break;
				}
			}
		}
	});
	$: viewTable;
</script>

<Modal bind:open={$previewTable.view} class="text-xs">
	<div class="pt-4">
		{#if table}
			<ViewTable>
				<TableHead>
					{#each table.schema.fields as field}
						<TableHeadCell padding="px-2 py-1 text-center" scope="col"
							><nobr>{field.name} ({field.type})</nobr></TableHeadCell
						>
					{/each}
				</TableHead>
				<TableBody>
					{#each viewTable as row}
						<TableBodyRow>
							{#each row as value}
								<TableBodyCell tdClass="px-2 py-1 text-center">{value}</TableBodyCell>
							{/each}
						</TableBodyRow>
					{/each}
				</TableBody>
			</ViewTable>
		{/if}
	</div>
	<div class="text-center">
		<span class="text-xs">(first 10 lines)</span>
	</div>
</Modal>

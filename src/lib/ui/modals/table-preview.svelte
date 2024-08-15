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
	import { previewTable } from '$lib/storeUtils';

	let viewTable: any[] = [];

	previewTable.subscribe((prvw) => {
		viewTable = [];
		if (prvw.table) {
			let maxLength = 10;
			for (const row of prvw.table.toArray()) {
				let rowArr = [];
				for (const value of row.toArray()) {
					rowArr.push(value);
				}
				viewTable.push(rowArr);
				if (--maxLength === 0) break;
			}
		}
	});
	$: viewTable;
</script>

<Modal bind:open={$previewTable.view} class="text-xs">
	<div class="pt-4">
		{#if $previewTable.table}
			<Table>
				<TableHead>
					{#each $previewTable.table.schema.fields as field}
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
			</Table>
		{/if}
	</div>
	<div class="text-center">
		<span class="text-xs">(first 10 lines)</span>
	</div>
</Modal>

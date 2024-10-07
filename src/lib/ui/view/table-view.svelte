<script lang="ts">
	import {
		Table as ViewTable,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';

	import type { Table } from '@apache-arrow/ts';
	import type { Readable } from 'svelte/store';
	export let table: Readable<Table | undefined>;
</script>

<div class="mt-2 min-w-96 max-w-7xl text-xs">
	{#if $table}
		<ViewTable>
			<TableHead>
				{#each $table.schema.fields as field}
					<TableHeadCell padding="px-2 py-1 text-center" scope="col"
						><nobr>{field.name}</nobr></TableHeadCell
					>
				{/each}
			</TableHead>
			<TableBody>
				{#each $table.toArray().slice(0, 10) as row}
					<TableBodyRow>
						{#each row.toArray() as value}
							<TableBodyCell tdClass="px-2 py-1 text-center">{value}</TableBodyCell>
						{/each}
					</TableBodyRow>
				{/each}
			</TableBody>
		</ViewTable>
	{/if}
	<div class="text-center">
		<span>(first 10 lines)</span>
	</div>
</div>

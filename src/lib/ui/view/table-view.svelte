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
	import type { Writable } from 'svelte/store';
	export let table: Writable<Table | undefined>;
</script>

<div class="max-w-4xl text-xs">
	{#if $table}
		<ViewTable>
			<TableHead>
				{#each $table.schema.fields as field}
					<TableHeadCell padding="px-2 py-1 text-center" scope="col"
						><nobr>{field.name} ({field.type})</nobr></TableHeadCell
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

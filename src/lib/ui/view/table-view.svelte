<script lang="ts">
	import {
		Pagination,
		Table as ViewTable,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import { slide } from 'svelte/transition';
	import type { Table } from '@apache-arrow/ts';
	import type { Readable, Writable } from 'svelte/store';
	import { ArrowLeftOutline, ArrowRightOutline } from 'flowbite-svelte-icons';

	export let table: Readable<Table | undefined>;
	export let total_items: Readable<number>;
	export let page: Writable<number>;

	let openRow: number | null;

	function toggleRow(i: number) {
		openRow = openRow === i ? null : i;
	}
</script>

<div class="mt-2">
	{#if $table}
		<ViewTable hoverable={true}>
			<TableHead>
				{#each $table.schema.fields as field, j}
					{#if j < 8}
						<TableHeadCell padding="px-2 py-1 text-center" scope="col"
							><nobr>{field.name}</nobr></TableHeadCell
						>
					{:else if j === 9}
						<TableBodyCell tdClass="px-2 py-1 text-center">...</TableBodyCell>
					{/if}
				{/each}
			</TableHead>
			<TableBody tableBodyClass="divide-y nodrag">
				{#each $table.toArray() as row, i}
					<TableBodyRow
						on:click={() => {
							if ($table?.schema.fields.length > 8) toggleRow(i);
						}}
					>
						{#each row.toArray() as value, j}
							{#if j < 8}
								<TableBodyCell tdClass="px-2 py-1 text-center">{value}</TableBodyCell>
							{:else if j === 9}
								<TableBodyCell tdClass="px-2 py-1 text-center">...</TableBodyCell>
							{/if}
						{/each}
					</TableBodyRow>
					{#if openRow === i}
						<TableBodyRow>
							<TableBodyCell colspan={Number(8)} class="p-0">
								<div
									class="grid w-max grid-cols-5 gap-1 py-2"
									transition:slide={{ duration: 300, axis: 'y' }}
								>
									{#each row.toArray() as value, j}
										<div class="grid grid-cols-2 border-2 border-dashed">
											<span class="ml-2 max-w-48">{$table.schema.fields[j].name}</span><span
												class="mr-2 text-right">{value}</span
											>
										</div>
									{/each}
								</div>
							</TableBodyCell>
						</TableBodyRow>
					{/if}
				{/each}
			</TableBody>
		</ViewTable>
	{/if}
	{#if $total_items > 10}
		<div class="grid grid-cols-2 gap-2 pt-2 mx-2">
			<Pagination
				table
				pages={[]}
				on:previous={() => {
					if ($page > 0) $page -= 10;
				}}
				on:next={() => {
					if ($page < $total_items) $page += 10;
				}}
			>
				<div slot="prev" class="flex items-center gap-2 bg-gray-800 text-white">
					<ArrowLeftOutline class="me-2 h-4 w-4" />
					Prev
				</div>
				<div slot="next" class="flex items-center gap-2 bg-gray-800 text-white">
					Next
					<ArrowRightOutline class="ms-2 h-4 w-4" />
				</div>
			</Pagination>
			<div class="mt-2 text-right text-sm text-gray-700 dark:text-gray-400">
				Showing <span class="font-semibold text-gray-900 dark:text-white">{$page + 1}</span>
				to
				<span class="font-semibold text-gray-900 dark:text-white"
					>{$page + 10 >= $total_items ? $total_items : $page + 10}</span
				>
				of
				<span class="font-semibold text-gray-900 dark:text-white">{$total_items}</span>
				Entries
			</div>
		</div>
	{/if}
</div>

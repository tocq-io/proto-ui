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
						<TableHeadCell padding="px-2 py-1 text-center bg-slate-200" scope="col"
							><nobr>{field.name}</nobr></TableHeadCell
						>
					{:else if j === 9}
						<TableHeadCell padding="px-2 py-1 text-center bg-slate-200">...</TableHeadCell>
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
		<div class="mx-2 grid grid-cols-2 gap-2 pt-2">
			<Pagination
				table
				pages={[]}
				normalClass="bg-slate-200 text-gray-900 hover:bg-purple-900 hover:text-purple-100 h-6"
				on:previous={() => {
					if ($page > 0) $page -= 10;
				}}
				on:next={() => {
					if ($page < $total_items) $page += 10;
				}}
			>
				<div slot="prev" class="flex items-center gap-2">
					<ArrowLeftOutline class="me-2 h-4 w-4" />
					Prev
				</div>
				<div slot="next" class="flex items-center gap-2">
					Next
					<ArrowRightOutline class="ms-2 h-4 w-4" />
				</div>
			</Pagination>
			<div class="mt-1 text-right text-xs font-semibold">
				<span class="bg-slate-200 text-gray-900 py-1.5 px-2.5 rounded">Showing <span>{$page + 1}</span>
				to
				<span>{$page + 10 >= $total_items ? $total_items : $page + 10}</span>
				of
				<span>{$total_items}</span>
				Entries</span>
			</div>
		</div>
	{/if}
</div>

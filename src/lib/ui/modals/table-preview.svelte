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
					{#each $previewTable.table.data as line}
						<TableBodyRow>
							{#each line.children as child}
								<TableBodyCell tdClass="px-2 py-1 text-center">{child.values[0]}</TableBodyCell>
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

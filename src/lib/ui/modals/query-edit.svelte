<script lang="ts">
	import { load_csv, run_sql, delete_table, has_table } from 'proto-query-engine';
	import {
		Alert,
		Button,
		Checkbox,
		Modal,
		Textarea,
		Toolbar,
		ToolbarButton
	} from 'flowbite-svelte';
	import {
		BullhornOutline,
		FloppyDiskAltOutline,
		RocketOutline,
		TrashBinOutline
	} from 'flowbite-svelte-icons';
	import { persistQuery, updateQuery } from '$lib/queryUtils';
	import { nodes, edges, type DataFileNode, sqlEditControl, isDataFileNode } from '$lib/storeUtils';
	import { tableFromIPC } from '@apache-arrow/ts';
	import type { FrameColor } from 'flowbite-svelte/Frame.svelte';

	let tables = new Map<string, string>();
	const defaultQuery = 'SELECT a, MIN(b) FROM test WHERE a <= b GROUP BY a LIMIT 100';
	let dbResult = defaultQuery;
	let alertColor: FrameColor = 'green';

	async function initTables(node: DataFileNode) {
		let hasTable = false;
		for (const edge of $edges) {
			if (edge.target == $sqlEditControl.queryId && edge.source === node.id) {
				hasTable = true;
				if (!(await has_table(node.id))) {
					load_csv(node.id, node.data.name);
				}
				if (!tables.has(node.id)) {
					tables.set(node.id, node.data.name);
				}
				break;
			}
		}
		return hasTable;
	}
	async function runSql() {
		run_sql($sqlEditControl.sql)
			.then((ipcResult) => {
				const table = tableFromIPC(ipcResult);
				dbResult = table.toString();
				alertColor = 'green';
			})
			.catch((e) => {
				let errMsg: string = e.message;
				if (errMsg.toLowerCase().includes('table') && errMsg.toLowerCase().includes('not found')) {
					errMsg = errMsg.replace('datafusion.public.', '') + '. Please load a table.';
				}
				dbResult = errMsg;
				alertColor = 'red';
			});
	}
	async function saveSqlNode() {
		const tableIds = new Set<string>(tables.keys());
		await persistQuery($sqlEditControl.sql, tableIds).then(() => ($sqlEditControl.done = true));
	}
	async function updateSqlNode() {
		const tableIds = new Set<string>(tables.keys());
		await updateQuery($sqlEditControl.sql, tableIds, $sqlEditControl.queryId).then(
			() => ($sqlEditControl.done = true)
		);
	}
	async function manageTable(e: Event) {
		const chck = <HTMLInputElement>e.target;
		if (chck?.checked) {
			if (!(await has_table(chck.id))) {
				load_csv(chck.id, chck.name);
				tables.set(chck.id, chck.name);
			}
		} else {
			delete_table(chck.id, chck.name);
			tables.delete(chck.id);
		}
	}
	async function unloadTables() {
		for (const [id, name] of tables) {
			delete_table(id, name);
		}
		dbResult = defaultQuery;
		alertColor = 'green';
		tables = new Map<string, string>();
	}
	$: dbResult;
</script>

<Modal
	title="Run a query on selected tables"
	bind:open={$sqlEditControl.view}
	on:close={() => unloadTables()}
	autoclose
	class="min-w-full"
>
	<Textarea
		id="sqlEditor"
		rows="8"
		class="mb-4"
		headerClass="h-10"
		placeholder="Write some Datafusion SQL"
		bind:value={$sqlEditControl.sql}
	>
		<div slot="header" class="mt-0.5 flex h-5/6 items-center justify-between">
			<span />
			<Toolbar embedded slot="end">
				<ToolbarButton size="sm" name="reset" on:click={() => ($sqlEditControl.sql = '')}
					><TrashBinOutline class="h-6 w-6" /></ToolbarButton
				>
				<ToolbarButton size="sm" name="run" on:click={() => runSql()}
					><RocketOutline class="h-6 w-6" /></ToolbarButton
				>
			</Toolbar>
		</div>
	</Textarea>

	<div class="grid pt-1 sm:grid-cols-2">
		<div class="flex gap-3">
			<span>Loaded tables:</span>
			{#each $nodes as node}
				{#if isDataFileNode(node)}
					{#await initTables(node) then hasTable}
						<Checkbox
							class="mb-4"
							checked={hasTable}
							name={node.data.name}
							id={node.id}
							on:change={(e) => manageTable(e)}>{node.data.name}</Checkbox
						>
					{/await}
				{/if}
			{/each}
		</div>
		<div class="text-right">
			{#if $sqlEditControl.queryId}
				<Button class="h-2/3 gap-1" color="primary" on:click={() => updateSqlNode()}
					><FloppyDiskAltOutline />Update Query</Button
				>
			{:else}
				<Button class="h-2/3 gap-1" color="primary" on:click={() => saveSqlNode()}
					><FloppyDiskAltOutline />Save Query</Button
				>
			{/if}
		</div>
	</div>
	<Alert color={alertColor}>
		<div class="flex items-center gap-3">
			<BullhornOutline class="h-5 w-5" />
			<span class="text-lg font-medium">Results</span>
		</div>
		<p class="mb-4 mt-2 text-sm">{dbResult}</p>
	</Alert>
</Modal>

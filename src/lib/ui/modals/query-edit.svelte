<script lang="ts">
	import { load_csv, run_sql, delete_table, has_table } from 'proto-query-engine';
	import {
		Alert,
		Button,
		ButtonGroup,
		Checkbox,
		InputAddon,
		Label,
		Modal,
		Input,
		Textarea,
		Toolbar,
		ToolbarButton
	} from 'flowbite-svelte';
	import { BullhornOutline, RocketOutline, TrashBinOutline } from 'flowbite-svelte-icons';
	import { persistQuery, updateQuery} from '$lib/queryUtils';
	import { nodes, edges, type DataFileNode, sqlEditControl, isDataFileNode } from '$lib/storeUtils';
	import { tableFromIPC } from '@apache-arrow/ts';

	let tables = new Map<string, string>();
	const defaultQuery = 'SELECT a, MIN(b) FROM test WHERE a <= b GROUP BY a LIMIT 100';
	let dbResult = defaultQuery;

	async function initTables(node: DataFileNode) {
		let hasTable = false;
		for (const edge of $edges) {
			if (edge.target == $sqlEditControl.queryId && edge.source === node.id){
				hasTable = true;
				load_csv(node.id, node.data.name);
				if (!(tables.has(node.id))) {
					tables.set(node.id, node.data.name);
				}
				break;
			}
		}		
		return hasTable;
	}
	async function runSql() {
		// SELECT a, MIN(b) FROM test WHERE a <= b GROUP BY a LIMIT 100
		run_sql($sqlEditControl.sql).then((ipcResult) => {
			const table = tableFromIPC(ipcResult);
			dbResult = table.toString();
		});
	}
	async function saveSqlNode() {
		$sqlEditControl.view = false;
		await persistQuery($sqlEditControl.sql, tables);
	}
	async function updateSqlNode() {
		$sqlEditControl.view = false;
		await updateQuery($sqlEditControl.sql, tables, $sqlEditControl.queryId);
	}
	async function manageTable(e: Event) {
		const chck = <HTMLInputElement>e.target;
		if (chck?.checked) {
			load_csv(chck.id, chck.name);
			tables.set(chck.id, chck.name);
		} else {
			delete_table(chck.id, chck.name);
			tables.delete(chck.id);
		}
	}
	async function unloadTables() {
		console.log("Unloading...");
		for (const [id, name] of tables){
			delete_table(id, name);
		}
		dbResult = defaultQuery;
	}
	$: dbResult;
</script>

<Modal
	title="Run SQL on one or many tables"
	bind:open={$sqlEditControl.view}
	on:close={()=>unloadTables()}
	autoclose
	class="min-w-full"
>
	<div class="flex gap-3">
		<span>Select table(s):</span>
		{#each $nodes as node}
			{#if isDataFileNode(node)}
				{#await initTables(node) then hasTable}
					<Checkbox
						checked={hasTable}
						name={node.data.name}
						id={node.id}
						on:change={(e) => manageTable(e)}>{node.data.name}</Checkbox
					>
				{/await}
			{/if}
		{/each}
	</div>
	<Textarea
		id="sqlEditor"
		rows="8"
		class="mb-4"
		placeholder="Write some Datafusion SQL"
		bind:value={$sqlEditControl.sql}
	>
		<div slot="footer" class="flex items-center justify-between">
			<span />
			<Toolbar embedded slot="end">
				<ToolbarButton name="reset" on:click={() => $sqlEditControl.sql = ''}
					><TrashBinOutline class="h-6 w-6" /></ToolbarButton
				>
				<ToolbarButton name="run" on:click={() => runSql()}
					><RocketOutline class="h-6 w-6" /></ToolbarButton
				>
			</Toolbar>
		</div>
	</Textarea>
	<Alert color="green">
		<div class="flex items-center gap-3">
			<BullhornOutline class="h-5 w-5" />
			<span class="text-lg font-medium">Results</span>
		</div>
		<p class="mb-4 mt-2 text-sm">{dbResult}</p>
	</Alert>
	<div>
		<Label for="input-addon" class="mb-2">Store result and configuration</Label>
		<ButtonGroup class="w-full">
			<InputAddon><Checkbox id="perist"><nobr>Persist result table</nobr></Checkbox></InputAddon>
			<Input id="input-addon" type="text" placeholder="=> name" />
			{#if $sqlEditControl.queryId}
				<Button color="primary" on:click={() => updateSqlNode()}><nobr>Update</nobr></Button>
			{:else}
				<Button color="primary" on:click={() => saveSqlNode()}><nobr>Save</nobr></Button>
			{/if}
		</ButtonGroup>
	</div>
</Modal>

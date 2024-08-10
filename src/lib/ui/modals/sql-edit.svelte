<script lang="ts">
	import init, { load_csv, run_sql, delete_table, has_table } from 'proto-query-engine';
	import { onMount } from 'svelte';
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
	import { digestString } from '$lib/signUtils';
	import { nodes, addTestEdge, addTestNode } from '$lib/flowUtils';
	import { tableFromIPC } from '@apache-arrow/ts';
	import type { Writable } from 'svelte/store';

	export let sqlConfigModal: Writable<boolean>;
	let tables: string[] = [];
	let dbResult = 'will be displayed here!';
	async function initTables(tableName: string, tableId: string) {
		let hasTable = await has_table(String(tableName));
		if (hasTable && !(tables.indexOf(tableId) > -1)) {
			tables.push(tableId);
		}
		return hasTable;
	}
	async function resetSql() {
		const text = <HTMLInputElement>document.getElementById('sqlEditor');
		if (text && text.value) {
			console.log(text.value);
			text.value = '';
		}
	}
	async function getSqlAsText() {
		const text = <HTMLInputElement>document.getElementById('sqlEditor');
		if (text && text.value) {
			console.log(text.value);
			return text.value;
		}
		return '';
	}
	async function runSql() {
		const sql = await getSqlAsText();
		// SELECT a, MIN(b) FROM test WHERE a <= b GROUP BY a LIMIT 100
		run_sql(sql).then((ipcResult) => {
			const table = tableFromIPC(ipcResult);
			console.log(table.toString());
			dbResult = table.toString();
		});
	}
	async function saveSqlNode() {
		console.log(tables);
		if (tables.length > 0) {
			// TODO more than 1 table
			let table = tables[0];
			sqlConfigModal.set(false);
			getSqlAsText().then((sql) =>
				digestString(sql).then((id) => addTestNode(id, sql, 120).then(() => addTestEdge(table, id)))
			);
		}
	}
	async function manageTable(e: Event) {
		const chck = <HTMLInputElement>e.target;
		if (chck?.checked) {
			load_csv(chck.id, chck.name);
			tables.push(chck.id);
		} else {
			delete_table(chck.id, chck.name);
			const index = tables.indexOf(chck.id);
			tables.splice(index, 1);
		}
	}
	onMount(async () => {
		await init();
	});
</script>

<Modal
	title="Run SQL on one or many tables"
	bind:open={$sqlConfigModal}
	autoclose
	class="min-w-full"
>
	<div class="flex gap-3">
		<span>Select table(s):</span>
		<!--Checkbox name="flavours" {choices} bind:group groupInputClass='ms-2'/-->
		{#each $nodes as node}
			{#await initTables(String(node.data.label), node.id) then hasTable}
				<Checkbox
					checked={hasTable}
					name={String(node.data.label)}
					id={node.id}
					on:change={(e) => manageTable(e)}>{node.data.label}</Checkbox
				>
			{/await}
		{/each}
	</div>
	<Textarea id="sqlEditor" rows="8" class="mb-4" placeholder="Write some Datafusion SQL">
		<div slot="footer" class="flex items-center justify-between">
			<span />
			<Toolbar embedded slot="end">
				<ToolbarButton name="reset" on:click={() => resetSql()}
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
		<p id="resultP" class="mb-4 mt-2 text-sm">{dbResult}</p>
	</Alert>
	<div>
		<Label for="input-addon" class="mb-2">Store result and configuration</Label>
		<ButtonGroup class="w-full">
			<InputAddon><Checkbox id="perist"><nobr>Persist result table</nobr></Checkbox></InputAddon>
			<Input id="input-addon" type="text" placeholder="=> name" />
			<Button color="primary" on:click={() => saveSqlNode()}><nobr>Save + Exit</nobr></Button>
		</ButtonGroup>
	</div>
</Modal>

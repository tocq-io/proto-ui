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
	import { persistQuery, type SqlEdit } from '$lib/queryUtils';
	import { nodes, type DataFileNode } from '$lib/flowUtils';
	import { type PreviewTable } from '$lib/queryUtils';
	import { tableFromIPC } from '@apache-arrow/ts';
	import type { Writable } from 'svelte/store';
	import type { Node } from '@xyflow/svelte';

	export let sqlEditControl: Writable<SqlEdit>;
	export let previewTable: Writable<PreviewTable>;
	let tables: string[] = [];
	let dbResult = 'SELECT a, MIN(b) FROM test WHERE a <= b GROUP BY a LIMIT 100';

	function isDataFileNode(node: Node): node is DataFileNode {
		return node.data.name !== undefined && node.data.schema !== undefined;
	}

	async function initTables(node: DataFileNode) {
		// TODO load from edges
		let hasTable = await has_table(node.data.name);
		if (hasTable && !(tables.indexOf(node.id) > -1)) {
			tables.push(node.id);
		}
		return hasTable;
	}
	async function resetSql() {
		sqlEditControl.update((ec) => {
			ec.sql = '';
			return ec;
		});
	}
	async function runSql() {
		// SELECT a, MIN(b) FROM test WHERE a <= b GROUP BY a LIMIT 100
		run_sql($sqlEditControl.sql).then((ipcResult) => {
			const table = tableFromIPC(ipcResult);
			console.log(table.toString());
			dbResult = table.toString();
		});
	}
	async function saveSqlNode() {
		console.log(tables);
		if (tables.length > 0) {
			sqlEditControl.update((ec) => {
				ec.view = false;
				return ec;
			});
			persistQuery($sqlEditControl.sql, tables, previewTable, sqlEditControl);
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
</script>

<Modal
	title="Run SQL on one or many tables"
	bind:open={$sqlEditControl.view}
	autoclose
	class="min-w-full"
>
	<div class="flex gap-3">
		<span>Select table(s):</span>
		<!--Checkbox name="flavours" {choices} bind:group groupInputClass='ms-2'/-->
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
		<p class="mb-4 mt-2 text-sm">{dbResult}</p>
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

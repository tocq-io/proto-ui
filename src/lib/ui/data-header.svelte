<script lang="ts">
	import init, { load_csv, run_sql, delete_table, has_table } from 'proto-query-engine';
	import { tableFromIPC } from '@apache-arrow/ts';
	import {
		Alert,
		Button,
		ButtonGroup,
		Checkbox,
		Fileupload,
		Input,
		InputAddon,
		Label,
		Modal,
		Textarea,
		Toolbar,
		ToolbarButton
	} from 'flowbite-svelte';
	import {
		BullhornOutline,
		PlusOutline,
		RocketOutline,
		TrashBinOutline
	} from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';
	import { digestString, openDB } from '$lib/signUtils';
	import { getAvailableGb, writeFile } from '$lib/fileUtils';
	import { nodesArray, addTestEdge,  addTestNode } from '$lib/flowUtils';

	let csvUploadModal = false;
	let sqlConfigModal = false;
	let files: FileList;
	let tables: string[] = [];
	let dbResult = 'will be displayed here!';
	async function importFiles() {
		if (files) {
			for (const file of files) {
				writeFile(file);
			}
			gbPromise = getAvailableGb();
		}
	}
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
			sqlConfigModal = false;
			getSqlAsText().then((sql) =>
				digestString(sql).then((id) =>
					addTestNode(id, sql, 120).then(() => addTestEdge(table, id))
				)
			);
		}
	}
	async function manageTable(e: Event) {
		if (e.target) {
			const chck = <HTMLInputElement>e.target;
			if (chck.checked) {
				load_csv(chck.id, chck.name);
				tables.push(chck.id);
			} else {
				delete_table(chck.id, chck.name);
				const index = tables.indexOf(chck.id);
				tables.splice(index, 1);
			}
		}
	}
	onMount(async () => {
		await init();
		openDB();
	});
	$: gbPromise = getAvailableGb();
</script>

<header class="px-8 text-gray-900 dark:text-white">
	<h1 class="mb-8 pt-12 text-8xl font-extrabold tracking-tight">
		Analyze your data in the browser
	</h1>
</header>
<section class="px-8">
	<div class="mb-4 grid gap-4 sm:grid-cols-2">
		{#await gbPromise}
			<p class="text-left text-2xl">--(/\)--</p>
		{:then gbs}
			<p class="text-left text-2xl">Upload and analyze up to {gbs} GB of CSV files.</p>
		{/await}
		<div class="text-right">
			<Button on:click={() => (csvUploadModal = true)}>
				<PlusOutline class="mr-2 h-3.5 w-3.5" /><span class="text-lg">CSV</span>
			</Button>
			<Button on:click={() => (sqlConfigModal = true)}>
				<PlusOutline class="mr-2 h-3.5 w-3.5" /><span class="text-lg">SQL</span>
			</Button>
		</div>
	</div>
	<Modal title="Upload some files" bind:open={csvUploadModal} autoclose class="min-w-full">
		<div class="mb-4 grid gap-4 sm:grid-cols-2">
			<div class="w-96">
				<Fileupload id="multiple_files" multiple bind:files />
			</div>
			<div class="text-right">
				<Button type="submit" class="w-44" on:click={() => importFiles()}>
					<PlusOutline class="mr-2 h-3.5 w-3.5" />Add new files
				</Button>
			</div>
		</div>
	</Modal>
	<Modal
		title="Run SQL on one or many tables"
		bind:open={sqlConfigModal}
		autoclose
		class="min-w-full"
	>
		<div class="flex gap-3">
			<span>Select table(s):</span>
			<!--Checkbox name="flavours" {choices} bind:group groupInputClass='ms-2'/-->
			{#each nodesArray as node}
				{#await initTables(String(node.data.label), node.id) then hasTable}
					{#if hasTable}
						<Checkbox
							checked
							name={String(node.data.label)}
							id={node.id}
							on:change={(e) => manageTable(e)}>{node.data.label}</Checkbox
						>
					{:else}
						<Checkbox name={String(node.data.label)} id={node.id} on:change={(e) => manageTable(e)}
							>{node.data.label}</Checkbox
						>
					{/if}
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
</section>

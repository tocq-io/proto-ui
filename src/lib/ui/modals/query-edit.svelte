<script lang="ts">
	import { run_sql } from 'proto-query-engine';
	import { Alert, Button, ButtonGroup, Modal } from 'flowbite-svelte';
	import { BullhornOutline, FloppyDiskAltOutline, RocketOutline } from 'flowbite-svelte-icons';
	import { persistQuery, updateQuery } from '$lib/queryUtils';
	import { sqlEditControl } from '$lib/storeUtils';
	import { tableFromIPC } from '@apache-arrow/ts';
	import type { FrameColor } from 'flowbite-svelte/Frame.svelte';
	import CodeEditor from '$lib/ui/editor/code-editor.svelte';
	import { writable } from 'svelte/store';

	let dbResult = '...';
	let alertColor: FrameColor = 'green';
	let codeText = writable('Select * from world');
	async function getTables(): Promise<Set<string>> {
		let tables = new Set<string>();
		return run_sql('EXPLAIN ' + $codeText).then((ipcResult) => {
			const table = tableFromIPC(ipcResult);
			for (const result of table.toArray()) {
				const row = result.toArray();
				// TODO this could probably be done in a more robust way on the rust side...
				if (row[0] === 'physical_plan') {
					for (const analysis of row[1].split(/\n/)) {
						let candidate: string = analysis.trim();
						const idLength = 'CsvExec: file_groups={1 group: [['.length;
						const startIndex = candidate.indexOf('CsvExec: ');
						if (startIndex == 0) {
							const endIndex = candidate.indexOf('.csv]]}, projection');
							candidate = candidate.substring(idLength, endIndex);
							tables.add(candidate.trim());
						}
					}
				}
			}
			return tables;
		});
	}
	async function showSql() {
		if ($codeText) {
			run_sql($codeText)
				.then((ipcResult) => {
					const tbl = tableFromIPC(ipcResult);
					const result = tbl.toString();
					dbResult = result.length > 1024 ? result.substring(0, 1024) + ' ... ... ...' : result;
					alertColor = 'green';
				})
				.catch((e) => {
					let errMsg = e.message;
					if (
						errMsg.toLowerCase().includes('table') &&
						errMsg.toLowerCase().includes('not found')
					) {
						errMsg = errMsg.replace('datafusion.public.', '') + '. Please load a table.';
					}
					dbResult = errMsg;
					alertColor = 'red';
				});
		}
	}
	async function saveSqlNode() {
		getTables().then((tableIds) => persistQuery($codeText, tableIds));
		$sqlEditControl.view = false;
	}
	async function updateSqlNode() {
		getTables().then((tableIds) => updateQuery($codeText, tableIds, $sqlEditControl.queryId));
		$sqlEditControl.view = false;
	}
	async function unload() {
		dbResult = '...';
		alertColor = 'green';
		$sqlEditControl.sql = '';
	}
	$: dbResult;
</script>

<Modal bind:open={$sqlEditControl.view} on:close={() => unload()} autoclose class="min-w-full">
	<div class="grid pt-4 sm:grid-cols-2">
		<div>
			<p class="text-lg font-semibold">Run SQL on selected tables</p>
		</div>
		<div class="text-right">
			<ButtonGroup>
				{#if $sqlEditControl.queryId}
					<Button size="lg" class="h-8 w-8" on:click={() => updateSqlNode()}
						><FloppyDiskAltOutline /></Button
					>
				{:else}
					<Button size="lg" class="h-8 w-8" on:click={() => saveSqlNode()}
						><FloppyDiskAltOutline /></Button
					>
				{/if}
				<Button size="lg" class="h-8 w-8" on:click={() => showSql()}><RocketOutline /></Button>
			</ButtonGroup>
		</div>
	</div>
	<CodeEditor {codeText} />
	<Alert color={alertColor}>
		<div class="flex items-center gap-3">
			<BullhornOutline class="h-5 w-5" />
			<span class="text-lg font-medium">Result preview</span>
		</div>
		<p class="mb-4 mt-2 text-sm">{dbResult}</p>
	</Alert>
</Modal>

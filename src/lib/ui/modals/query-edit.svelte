<script lang="ts">
	import { run_sql } from 'proto-query-engine';
	import {
		Alert,
		Button,
		ButtonGroup,
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
	import { results, sqlEditControl } from '$lib/storeUtils';
	import { Table, tableFromIPC } from '@apache-arrow/ts';
	import type { FrameColor } from 'flowbite-svelte/Frame.svelte';
	import CodeEditor from '$lib/ui/editor/code-editor.svelte';

	let dbResult = '...';
	let errMsg: string = '';
	let alertColor: FrameColor = 'green';
	async function getTables(): Promise<Set<string>> {
		let tables = new Set<string>();
		return run_sql('EXPLAIN ' + $sqlEditControl.sql).then((ipcResult) => {
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
	async function runSql(): Promise<Table | undefined> {
		return run_sql($sqlEditControl.sql)
			.then((ipcResult) => {
				return tableFromIPC(ipcResult);
			})
			.catch((e) => {
				errMsg = e.message;
				return undefined;
			});
	}
	async function showSql() {
		runSql().then((tbl) => {
			if (tbl) {
				const result = tbl.toString();
				dbResult = result.length > 1024 ? result.substring(0, 1024) + ' ... ... ...' : result;
				alertColor = 'green';
			} else {
				if (errMsg.toLowerCase().includes('table') && errMsg.toLowerCase().includes('not found')) {
					errMsg = errMsg.replace('datafusion.public.', '') + '. Please load a table.';
				}
				dbResult = errMsg;
				alertColor = 'red';
				errMsg = '';
			}
		});
	}
	async function saveSqlNode() {
		getTables().then((tableIds) =>
			persistQuery($sqlEditControl.sql, tableIds).then((id) => {
				runSql().then((tbl) => {
					if (tbl) {
						results.update((rslt) => {
							rslt.set(id, tbl);
							return rslt;
						});
					}
				});
			})
		);
		$sqlEditControl.view = false;
	}
	async function updateSqlNode() {
		getTables().then((tableIds) =>
			updateQuery($sqlEditControl.sql, tableIds, $sqlEditControl.queryId).then((id) => {
				runSql().then((tbl) => {
					if (tbl) {
						results.update((rslt) => {
							rslt.set(id, tbl);
							return rslt;
						});
					}
				});
			})
		);
		$sqlEditControl.view = false;
	}
	async function unload() {
		dbResult = '...';
		alertColor = 'green';
	}
	$: dbResult;
</script>

<Modal
	bind:open={$sqlEditControl.view}
	on:close={() => unload()}
	autoclose
	class="min-w-full"
>
	<div class="grid sm:grid-cols-2 pt-4">
		<div>
			<p class="mt-1 text-lg font-semibold">Run a query on selected tables</p>
		</div>
		<div class="text-right">
			<ButtonGroup>
				<Button
					on:click={() => (($sqlEditControl.sql = ''), (dbResult = '...'), (alertColor = 'green'))}
					><TrashBinOutline /></Button
				>
				{#if $sqlEditControl.queryId}
					<Button on:click={() => updateSqlNode()}><FloppyDiskAltOutline /></Button>
				{:else}
					<Button on:click={() => saveSqlNode()}><FloppyDiskAltOutline /></Button>
				{/if}
				<Button on:click={() => showSql()}><RocketOutline /></Button>
			</ButtonGroup>
		</div>
	</div>
	<CodeEditor />
	<Alert color={alertColor}>
		<div class="flex items-center gap-3">
			<BullhornOutline class="h-5 w-5" />
			<span class="text-lg font-medium">Result preview</span>
		</div>
		<p class="mb-4 mt-2 text-sm">{dbResult}</p>
	</Alert>
</Modal>

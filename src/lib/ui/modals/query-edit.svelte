<script lang="ts">
	import { run_sql } from 'proto-query-engine';
	import { Alert, Modal, Textarea, Toolbar, ToolbarButton } from 'flowbite-svelte';
	import {
		BullhornOutline,
		FloppyDiskAltOutline,
		RocketOutline,
		TrashBinOutline
	} from 'flowbite-svelte-icons';
	import { persistQuery, updateQuery } from '$lib/queryUtils';
	import { sqlEditControl } from '$lib/storeUtils';
	import { tableFromIPC } from '@apache-arrow/ts';
	import type { FrameColor } from 'flowbite-svelte/Frame.svelte';

	//let tables = new Map<string, string>();
	let dbResult = '...';
	let alertColor: FrameColor = 'green';
	async function getTables(): Promise<Set<string>> {
		let tables = new Set<string>();
		return run_sql('EXPLAIN ' + $sqlEditControl.sql).then((ipcResult) => {
			const table = tableFromIPC(ipcResult);
			for (const result of table.toArray()) {
				const row = result.toArray();
				// TODO this could probably be done in a more robust way...
				if (row[0] === 'physical_plan') {
					for (const analysis of row[1].split(/\n/)) {
						let candidate: string = analysis.trim();
						const idLength = 'CsvExec: file_groups={1 group: [['.length;
						const startIndex = candidate.indexOf('CsvExec: file_groups={1 group: [[');
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
	async function runSql() {
		run_sql($sqlEditControl.sql)
			.then((ipcResult) => {
				const table = tableFromIPC(ipcResult);
				const result = table.toString();
				dbResult = result.length > 1024 ? result.substring(0, 1024) + ' ... ... ...' : result;
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
		const tableIds = await getTables();
		await persistQuery($sqlEditControl.sql, tableIds).then(() => ($sqlEditControl.done = true));
		$sqlEditControl.view = false;
	}
	async function updateSqlNode() {
		const tableIds = await getTables();
		await updateQuery($sqlEditControl.sql, tableIds, $sqlEditControl.queryId).then(
			() => ($sqlEditControl.done = true)
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
	title="Run a query on selected tables"
	bind:open={$sqlEditControl.view}
	on:close={() => unload()}
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
			<Toolbar embedded slot="start">
				<ToolbarButton
					size="sm"
					name="reset"
					on:click={() => (($sqlEditControl.sql = ''), (dbResult = '...'))}
					><TrashBinOutline class="h-6 w-6" /></ToolbarButton
				>
			</Toolbar>
			<Toolbar embedded slot="end">
				{#if $sqlEditControl.queryId}
					<ToolbarButton size="sm" name="reset" on:click={() => updateSqlNode()}
						><FloppyDiskAltOutline class="h-6 w-6" /></ToolbarButton
					>
				{:else}
					<ToolbarButton size="sm" name="run" on:click={() => saveSqlNode()}
						><FloppyDiskAltOutline /></ToolbarButton
					>
				{/if}
				<ToolbarButton size="sm" name="run" on:click={() => runSql()}
					><RocketOutline class="h-6 w-6" /></ToolbarButton
				>
			</Toolbar>
		</div>
	</Textarea>
	<Alert color={alertColor}>
		<div class="flex items-center gap-3">
			<BullhornOutline class="h-5 w-5" />
			<span class="text-lg font-medium">Result preview</span>
		</div>
		<p class="mb-4 mt-2 text-sm">{dbResult}</p>
	</Alert>
</Modal>

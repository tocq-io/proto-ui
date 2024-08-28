<script lang="ts">
	import { Handle, Position } from '@xyflow/svelte';
	import { Alert, Button, ButtonGroup } from 'flowbite-svelte';
	import {
		ChartMixedOutline,
		CloseCircleOutline,
		EyeOutline,
		FloppyDiskAltOutline
	} from 'flowbite-svelte-icons';
	import { type QueryProps } from '$lib/storeUtils';
	import CodeEditor from '$lib/ui/editor/sql-editor.svelte';
	import { deleteQuery, persistQuery, updateQuery } from '$lib/crudUtils';
	import { writable } from 'svelte/store';
	import { browser } from '$app/environment';
	import { getTables } from '$lib/arrowSqlUtils';
	import { addChart, setPreviewData } from '$lib/nodesUtils';

	type $$Props = QueryProps;
	$$restProps;

	export let data: $$Props['data'];
	export let id: $$Props['id'];
	export let type: $$Props['type'];
	let codeText = writable(data.sql);
	let editorElementId = browser ? self.crypto.randomUUID() : 'init_id';

	async function deleteSqlNode() {
		deleteQuery(id);
	}
	async function saveSqlNode() {
		getTables($codeText).then((tableIds) => {
			if (id === 'empty_query') {
				persistQuery($codeText, tableIds);
				console.log(id);
			} else {
				updateQuery($codeText, tableIds, id);
			}
		});
	}
</script>

<Handle type="target" position={Position.Top} />
<div>
	<div class="mb-2 grid sm:grid-cols-2">
		<div class="flex gap-2">
			<Button class="mt-0.5 h-6 w-6" pill size="xs" color="primary" on:click={() => deleteSqlNode()}
				><CloseCircleOutline color="white" size="lg" strokeWidth="3" /></Button
			><span class="text-xl font-semibold">DF Query</span>
		</div>
		<div class="text-right">
			<ButtonGroup>
				<Button
					size="lg"
					class="h-8 w-8"
					on:click={() => setPreviewData(id)}
					disabled={id === 'empty_query'}><EyeOutline /></Button
				>
				<Button
					size="lg"
					class="h-8 w-8"
					on:click={() => addChart(id, type)}
					disabled={id === 'empty_query'}><ChartMixedOutline /></Button
				>
				<Button size="lg" class="h-8 w-8" on:click={() => saveSqlNode()}
					><FloppyDiskAltOutline /></Button
				>
			</ButtonGroup>
		</div>
	</div>
	<Alert color="blue" class="py-2">
		<CodeEditor {codeText} {editorElementId} />
	</Alert>
	<Alert color="light" class="p-2 mt-1">
		<div class="flex gap-0.5 text-xs">
			<span class="w-28"><nobr>[format: {data.format}]</nobr></span>
			<span class="text-right w-full">[{id}]</span>
		</div>
	</Alert>
</div>
<Handle type="source" position={Position.Bottom} />

<script lang="ts">
	import type { PreviewData } from '$lib/flowUtils';
	import { Handle, Position, type NodeProps } from '@xyflow/svelte';
	import { Button } from 'flowbite-svelte';
	import { TableRowOutline } from 'flowbite-svelte-icons';
	import type { Writable } from 'svelte/store';

	type $$Props = NodeProps;
	$$restProps;

	export let data: $$Props['data'];
	export let id: $$Props['id'];
	let name = <string>data.name;
	let size = <number>data.size;
	let schema = <string[]>data.schema;
	let format = <string>data.format;
	let previewData = <Writable<PreviewData>>data.view;

	async function setPreviewData(){
		$previewData.id = id;
		$previewData.name = name;
		$previewData.view = true;
	}
</script>

<Handle type="target" position={Position.Top} />
<div>
	<div class="-mb-2 grid sm:grid-cols-2">
		<div>
			<strong>TABLE [{name}] </strong>
		</div>
		<div class="text-right">
			<Button class="h-3/5 w-1/2" on:click={() => setPreviewData()}
				><TableRowOutline /><span class="pl-1.5 text-sm">View</span></Button
			>
		</div>
	</div>
	<hr />
	<div>
		<span class="text-xs">[format: {format}] [size: {size}]</span>
	</div>
	<div>
		<span class="text-xs">[{id}]</span>
	</div>
</div>
<Handle type="source" position={Position.Bottom} />

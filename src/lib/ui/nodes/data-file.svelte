<script lang="ts">
	import { Handle, Position, type NodeProps } from '@xyflow/svelte';
	import { Badge } from 'flowbite-svelte';

	type $$Props = NodeProps;
	$$restProps;

	export let data: $$Props['data'];
	export let id: $$Props['id'];
	let name = <string>data.name;
	let size = <number>data.size;
	let schema = <string[]>data.schema;
	let format = <string>data.format;
</script>

<Handle type="target" position={Position.Left} />
<div>
	<div class="grid sm:grid-cols-2">
		<p>
			<strong>TABLE [{name}] </strong>
		</p>
		<div class="text-right">
			<Badge color="purple">[{format}] [size: {size}]</Badge>
		</div>
	</div>
	<p class="left py-3">columns: [{schema}]</p>
	<p>
		<Badge color="dark">[id: {id}]</Badge>
	</p>
</div>
<Handle type="source" position={Position.Right} />

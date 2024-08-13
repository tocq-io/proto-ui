<script lang="ts">
	import { Handle, Position, type NodeProps } from '@xyflow/svelte';
	import { Badge } from 'flowbite-svelte';

	type $$Props = NodeProps;
	$$restProps;

	export let data: $$Props['data'];
	export let id: $$Props['id'];
	let sql = <string>data.sql;
    let format = <string>data.format;
</script>

<Handle type="target" position={Position.Top} />
<div>
	<div class="grid sm:grid-cols-2">
		<p>
			<strong>DF Query</strong>
		</p>
		<div class="text-right">
			<Badge color="purple">[{format}]]</Badge>
		</div>
	</div>
	<p class="left py-3">statement: [{sql}]</p>
	<p>
		<Badge color="dark">[id: {id}]</Badge>
	</p>
</div>
<Handle type="source" position={Position.Bottom} />
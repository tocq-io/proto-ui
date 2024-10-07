<script lang="ts">
	import { type EdgeProps, getBezierPath, BaseEdge, EdgeLabelRenderer } from '@xyflow/svelte';

	type $$Props = EdgeProps;
	$$restProps;

	export let sourceX: $$Props['sourceX'];
	export let sourceY: $$Props['sourceY'];
	export let sourcePosition: $$Props['sourcePosition'];
	export let targetX: $$Props['targetX'];
	export let targetY: $$Props['targetY'];
	export let targetPosition: $$Props['targetPosition'];
	export let data: $$Props['data'] = undefined;

	$: [edgePath] = getBezierPath({
		sourceX,
		sourceY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition
	});
</script>

<BaseEdge path={edgePath} />

<EdgeLabelRenderer>
	<div
		style:transform={`translate(-50%, -100%) translate(${targetX}px,${targetY}px)`}
		class="edge-label nodrag nopan"
	>
		{data.label}
	</div>
</EdgeLabelRenderer>

<style>
	.edge-label {
		position: absolute;
		background: rgba(255, 255, 255, 0.35);
		padding: 6px 16px;
		border-radius: 5px;
		font-family: sans-serif;
		font-size: 12px;
		font-weight: 500;
	}
</style>

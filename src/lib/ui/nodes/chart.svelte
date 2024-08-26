<script lang="ts">
	import { Handle, Position } from '@xyflow/svelte';
	import { Button } from 'flowbite-svelte';
	import { CloseCircleOutline, EditOutline } from 'flowbite-svelte-icons';
	import { type ChartProps } from '$lib/storeUtils';
	import ChartView from '$lib/ui/view/chart-view.svelte';
	import { deleteChart } from '$lib/crudUtils';
	import { browser } from '$app/environment';

	type $$Props = ChartProps;
	$$restProps;

	export let data: $$Props['data'];
	export let id: $$Props['id'];
	let wrapperId = browser ? self.crypto.randomUUID() : "init_id";

	async function showEditView() {}
	async function deleteChartNode() {
		deleteChart(id);
	}
</script>

<Handle type="target" position={Position.Top} />
<div>
	<div class="-mb-2 grid sm:grid-cols-2">
		<div class="flex gap-2">
			<Button
				class="mt-0.5 h-6 w-6"
				pill
				size="xs"
				color="primary"
				on:click={() => deleteChartNode()}
				><CloseCircleOutline color="white" size="lg" strokeWidth="3" /></Button
			><span class="text-xl font-semibold">Chart</span>
		</div>
		<div class="text-right">
			<Button class="h-3/5 w-1/2" on:click={() => showEditView()}
				><EditOutline /><span class="pl-1.5 text-sm">Edit</span></Button
			>
		</div>
	</div>
	<hr />
	<ChartView chartLocalData={data.chartData} {wrapperId} />
</div>

<script lang="ts">
	import { Handle, Position } from '@xyflow/svelte';
	import { Button, Radio } from 'flowbite-svelte';
	import { CloseCircleOutline } from 'flowbite-svelte-icons';
	import { type ChartProps } from '$lib/storeUtils';
	import ChartView from '$lib/ui/view/chart-view.svelte';
	import { deleteChart } from '$lib/crudUtils';
	import { browser } from '$app/environment';

	type $$Props = ChartProps;
	$$restProps;

	export let data: $$Props['data'];
	export let id: $$Props['id'];
	let wrapperId = browser ? self.crypto.randomUUID() : "init_id";
	let chartData = data.chartData;

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
		<div class="flex gap-3 pl-3">
			<Radio value="bar" bind:group={$chartData.type}
				><span class="text-sm font-normal text-gray-500">Bars</span></Radio
			>
			<Radio value="line" bind:group={$chartData.type}
				><span class="text-sm font-normal text-gray-500">Lines</span></Radio
			>
			<Radio value="bubble" bind:group={$chartData.type} disabled
				><span class="text-sm font-normal text-gray-500"><nobr><s>Bubbles</s> &#x1F37E;</nobr></span></Radio
			>
		</div>
	</div>
	<hr style="border-top: dotted 1px;" class="mt-3"/>
	<ChartView chartLocalData={chartData} {wrapperId} />
</div>

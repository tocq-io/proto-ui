<script lang="ts">
	import { Alert, Radio } from 'flowbite-svelte';
	import { InfoCircleSolid } from 'flowbite-svelte-icons';
	import type { Table } from '@apache-arrow/ts';
	import ChartView from './chart-view.svelte';
	import { type Readable, type Writable } from 'svelte/store';
	export let chartType: Writable<string>;
	export let table: Readable<Table | undefined>;
	export let wrapperDivId: string;
</script>

<div>
	<div>
		<Alert color="green" class="my-3 p-0.5 pl-6">
			<InfoCircleSolid slot="icon" class="h-4 w-4" />
			<span class="text-xs">Charts 1st column as x-axis, up to 8 columns on y-axis.</span>
		</Alert>
	</div>
	<ChartView {chartType} {table} {wrapperDivId} />
	<div class="flex gap-3 pl-6">
		<Radio value="bar" bind:group={$chartType}
			><span class="text-sm font-normal text-gray-500">Bars</span></Radio
		>
		<Radio value="line" bind:group={$chartType}
			><span class="text-sm font-normal text-gray-500">Lines</span></Radio
		>
		<Radio value="bubble" bind:group={$chartType} disabled
			><span class="text-sm font-normal text-gray-500"><nobr><s>Bubbles</s> &#x1F37E;</nobr></span
			></Radio
		>
	</div>
</div>

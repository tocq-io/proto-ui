<script lang="ts">
	import type { TocqNode } from '$lib/graphUtils';
	import { tables } from '$lib/storeUtils';
	import type { Table } from '@apache-arrow/ts';
	import { Chart, registerables } from 'chart.js';
	import { Alert, Radio } from 'flowbite-svelte';
	import { InfoCircleSolid } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';
	import { type Writable } from 'svelte/store';

	export let data: Writable<TocqNode>;
	let table: Table | undefined;
	export let tableId: string;
	let chartId = 'init_cid';
	//let chart: Chart | undefined;
	enum CHART_TYPE {
		Bar = 'bar',
		Line = 'line',
		Bubble = 'bubble'
	}

	function getCanvas() {
		const chart = Chart.getChart(chartId);
		chart?.destroy();
		const wrapperDiv = document.getElementById(tableId);
		while (wrapperDiv?.firstChild) {
			wrapperDiv?.removeChild(wrapperDiv?.firstChild);
		}
		const canvas = document.createElement('canvas');
		canvas.setAttribute('class', 'w-full');
		canvas.setAttribute('id', chartId);
		wrapperDiv?.appendChild(canvas);
		return canvas;
	}

	function getChartType(chartType: string) {
		switch (chartType) {
			case 'line':
				return CHART_TYPE.Line;
			case 'bubble':
				return CHART_TYPE.Bubble;
			case 'bar':
			default:
				return CHART_TYPE.Bar;
		}
	}
	function setChart(chartType: string) {
		if (!table) return;

		const tblArr = table.toArray();
		const x = table.schema.fields[0].name;
		const y = table.schema.fields.slice(1, 9);
		let datasets: any[] = [];

		switch (chartType) {
			case 'bar':
			case 'line':
				y?.forEach((s) => {
					datasets.push({
						label: s.name,
						data: tblArr.map((row) => row[s.name])
					});
				});
				break;
			case 'bubble':
			case 'scatter':
			case 'pie':
			case 'doughnut':
			case 'polarArea':
			case 'radar':
		}
		new Chart(getCanvas(), {
			type: getChartType(chartType),
			data: {
				labels: tblArr.map((row) => row[x]),
				datasets: datasets
			},
			options: {
				scales: {
					y: {
						beginAtZero: true
					}
				}
			}
		});
	}

	onMount(async () => {
		chartId = self.crypto.randomUUID();
		Chart.register(...registerables);
		tables.subscribe((tbls) => {
			table = tbls.get(tableId);
			setChart($data.chartType);
		});
	});
</script>

<div>
	<div>
		<Alert color="green" class="my-3 p-0.5 pl-6">
			<InfoCircleSolid slot="icon" class="h-4 w-4" />
			<span class="text-xs">Charts 1st column as x-axis, up to 8 columns on y-axis.</span>
		</Alert>
	</div>
	<div id={tableId} class="max-h-80 min-h-48" />
	<div class="flex gap-3 pl-6">
		<Radio value="bar" bind:group={$data.chartType} on:click={() => setChart('bar')}
			><span class="text-sm font-normal text-gray-500">Bars</span></Radio
		>
		<Radio value="line" bind:group={$data.chartType} on:click={() => setChart('line')}
			><span class="text-sm font-normal text-gray-500">Lines</span></Radio
		>
		<Radio value="bubble" bind:group={$data.chartType} on:click={() => setChart('bubble')} disabled
			><span class="text-sm font-normal text-gray-500"><nobr><s>Bubbles</s> &#x1F37E;</nobr></span
			></Radio
		>
	</div>
</div>

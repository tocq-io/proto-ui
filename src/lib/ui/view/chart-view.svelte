<script lang="ts">
	import { CHART_TYPE, tables, type ChartViewTable } from '$lib/storeUtils';
	import { Chart, registerables } from 'chart.js';
	import { onMount } from 'svelte';
	import type { Writable } from 'svelte/store';

	let chart: Chart | undefined;
	let chartType: string;
	export let chartLocalData: Writable<ChartViewTable>;
	export let wrapperId: string;
	let chartId = 'init_cid';

	function setCanvas() {
		const wrapperDiv = document.getElementById(wrapperId);
		while (wrapperDiv?.firstChild) {
			wrapperDiv?.removeChild(wrapperDiv?.firstChild);
		}
		const canvas = document.createElement('canvas');
		canvas.setAttribute('class', 'w-full');
		canvas.setAttribute('id', chartId);
		wrapperDiv?.appendChild(canvas);
	}

	function getChartType(type: string){
		switch (type) {
			case 'line':
				return CHART_TYPE.Line;
			case 'bubble':
				return CHART_TYPE.Bubble;
			case 'bar':
			default:
				return CHART_TYPE.Bar;
		}
	}

	function setChart(type: string) {
		setCanvas();
		const chartElement = <HTMLCanvasElement>document.getElementById(chartId);
		return new Chart(chartElement, {
			type: getChartType(type),
			data: {
				labels: [],
				datasets: [
					{
						label: '',
						data: [],
						borderWidth: 1
					}
				]
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
		chartType = $chartLocalData.type;
		chart = setChart($chartLocalData.type);
		chartLocalData.subscribe((localData) => {
			if (localData.type != chartType) {
				chart = setChart(localData.type);
				chartType = localData.type;
			}
			if (localData.tableId && chart) {
				if (chart.data.labels) {
					chart.data.labels.pop();
					chart.data.datasets.forEach((dataset) => {
						dataset.data.pop();
					});
				}
				const table = $tables.get(localData.tableId);
				if (chart.data.labels && table) {
					const tblArr = table.toArray();
					const x = table.schema.fields[0].name;
					const y = table.schema.fields.slice(1, 9);
					chart.data.labels = tblArr.map((row) => row[x]);
					let datasets: any[] = [];

					switch (localData.type) {
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
					chart.data.datasets = datasets;
				}
				chart?.update();
			}
		});
	});
</script>

<div id={wrapperId} class="min-h-64 max-h-80" />

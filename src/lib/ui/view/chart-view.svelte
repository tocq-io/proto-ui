<script lang="ts">
	import { CHART_TYPE, tables, type ChartLocalData } from '$lib/storeUtils';
	import { Chart, registerables, type ChartTypeRegistry } from 'chart.js';
	import { onMount } from 'svelte';
	import type { Writable } from 'svelte/store';

	let chart: Chart | undefined;
	let chartType: string;
	export let chartLocalData: Writable<ChartLocalData>;
	export let wrapperId: string;
	let chartId = 'init_cid';

	function setCanvas() {
		const wrapperDiv = document.getElementById(wrapperId);
		while (wrapperDiv?.firstChild) {
			wrapperDiv?.removeChild(wrapperDiv?.firstChild);
		}
		const canvas = document.createElement('canvas');
		canvas.setAttribute('style', 'width: 100%');
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
				chart?.reset();
			}
			if (localData.dataId && chart) {
				if (chart.data.labels) {
					chart.data.labels.pop();
					chart.data.datasets.forEach((dataset) => {
						dataset.data.pop();
					});
				}
				const table = $tables.get(localData.dataId);
				if (chart.data.labels && table && localData.x) {
					const tblArr = table.toArray();
					const x = localData.x;
					const r = localData.r;
					const y = localData.y;
					chart.data.labels = tblArr.map((row) => row[x]);
					let datasets: any[] = [];

					switch (localData.type) {
						case 'bar':
						case 'line':
							y?.forEach((s) => {
								datasets.push({
									label: s,
									data: tblArr.map((row) => row[s])
								});
							});
							break;
						case 'bubble':
							if (r && y) {
								datasets.push({
									label: y[0],
									data: tblArr.map((row) => ({
										x: row[x],
										y: row[y[0]],
										r: row[r]
									}))
								});
							}
							break;
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

<div id={wrapperId} />

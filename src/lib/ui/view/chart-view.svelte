<script lang="ts">
	import { DEFAULT_CHART_TYPE, type ChartLocalData } from '$lib/storeUtils';
	import { Chart, registerables, type ChartTypeRegistry } from 'chart.js';
	import { onMount } from 'svelte';
	import type { Writable } from 'svelte/store';

	let chart: Chart | undefined;
	let chartType: string;
	export let chartLocalData: Writable<ChartLocalData>;

	function setCanvas(){
		const wrapperDiv = document.getElementById('canvasWrapper');
		while (wrapperDiv?.firstChild) {
			wrapperDiv?.removeChild(wrapperDiv?.firstChild);
		}
		const canvas = document.createElement("canvas");
		canvas.setAttribute("style", "width: 100%");
		canvas.setAttribute("id", "tocqCchart");
		wrapperDiv?.appendChild(canvas);
	}

	function setChart(type: keyof ChartTypeRegistry) {
		setCanvas();
		const chartElement = <HTMLCanvasElement>document.getElementById('tocqCchart')
		return new Chart(chartElement, {
			type: type,
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
		Chart.register(...registerables);
		chartType = $chartLocalData.type;
		chart = setChart($chartLocalData.type);
		chartLocalData.subscribe((localData) => {
			if (localData.type != chartType) {
				chart = setChart(localData.type);
				chartType = localData.type;
				chart?.reset();
			}
			if (localData.data && chart) {
				if (chart.data.labels) {
					chart.data.labels.pop();
					chart.data.datasets.forEach((dataset) => {
						dataset.data.pop();
					});
				}
				for (const dt of localData.data) {
					if (chart.data.labels && dt.table && dt.x && dt.y) {
						const tblArr = dt.table.toArray();
						const x = dt.x;
						const y = dt.y;
						chart.data.labels = tblArr.map((row) => row[x]);
						chart.data.datasets.forEach((dataset) => {
							dataset.label = dt.y;
							dataset.data = tblArr.map((row) => row[y]);
						});
					}
				}
				chart?.update();
			}
		});
	});
</script>

<div id="canvasWrapper" />

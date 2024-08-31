<script lang="ts">
	import type { Table } from '@apache-arrow/ts';
	import { Chart, registerables } from 'chart.js';
	import { onMount } from 'svelte';
	import { type Readable } from 'svelte/store';

	export let table: Readable<Table | undefined>;
	export let chartType: Readable<string>;
	export let wrapperDivId: string;
	let canvasElId: string;
	let canvas: HTMLCanvasElement;
	let chart: Chart | undefined;
	enum CHART_TYPE {
		Bar = 'bar',
		Line = 'line',
		Bubble = 'bubble'
	}

	function setCanvas() {
		canvas?.remove();
		const host = document.getElementById(wrapperDivId);
		const shadow = host?.shadowRoot || host?.attachShadow({ mode: 'open' });
		canvas = document.createElement('canvas');
		canvas.setAttribute('class', 'w-full');
		canvas.setAttribute('id', canvasElId);
		shadow?.appendChild(canvas);
	}

	function getChartType() {
		switch ($chartType) {
			case 'line':
				return CHART_TYPE.Line;
			case 'bubble':
				return CHART_TYPE.Bubble;
			case 'bar':
			default:
				return CHART_TYPE.Bar;
		}
	}
	function setChart() {
		chart?.destroy();
		setCanvas();
		let datasets: any[] = [];
		let tblArr: any[] = [];
		let x = '';
		if ($table) {
			tblArr = $table.toArray();
			x = $table.schema.fields[0].name;
			const y = $table.schema.fields.slice(1, 9);
			switch ($chartType) {
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
		}
		chart = new Chart(canvas, {
			type: getChartType(),
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
		return '';
	}

	onMount(async () => {
		canvasElId = window.crypto.randomUUID();
		Chart.register(...registerables);
	});
	$: table && setChart();
	$: chartType && setChart();
</script>

<div id={wrapperDivId} class="max-h-80 min-h-52" />

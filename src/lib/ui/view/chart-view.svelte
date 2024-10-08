<script lang="ts">
	import { setErrorView } from '$lib/storeUtils';
	import type { Table } from '@apache-arrow/ts';
	import { Chart, registerables } from 'chart.js';
	import { onMount } from 'svelte';
	import { type Readable } from 'svelte/store';

	export let table: Readable<Table | undefined>;
	export let jsText: Readable<string>;
	export let chartViewElementId: string;
	let canvasElId: string = window ? window.crypto.randomUUID() : '';
	let canvas: HTMLCanvasElement;
	let chart: Chart | undefined;

	export function downloadChart(){
		if (chart) {
			var a = document.createElement('a');
			a.href = chart.toBase64Image();
			a.download = 'chart_'+canvasElId+'.png';
			// Trigger the download
			a.click();
		}
	}

	function setCanvas() {
		canvas?.remove();
		const host = document.getElementById(chartViewElementId);
		const shadow = host?.shadowRoot || host?.attachShadow({ mode: 'open' });
		canvas = document.createElement('canvas');
		canvas.setAttribute('class', 'w-full');
		canvas.setAttribute('id', canvasElId);
		shadow?.appendChild(canvas);
	}

	function setChart() {
		chart?.destroy();
		setCanvas();
		let cfg = {
			type: 'bar',
			data: {
				labels: [],
				datasets: []
			}
		};
		if ($table && $jsText) {
			// TODO: this is very simple, maybe add some checks
			cfg = eval('(' + $jsText + ')');
		}
		try {
			chart = new Chart(canvas, cfg);
		} catch(e){
			let errMsg = 'chart config: ';
			if (typeof e === "string") {
				errMsg += e.toUpperCase() // works, `e` narrowed to string
			} else if (e instanceof Error) {
				errMsg += e.message // works, `e` narrowed to Error
			}
			setErrorView(errMsg);
		}
	}

	onMount(async () => {
		Chart.register(...registerables);
	});
	$: if (table) setChart();
	$: if (jsText) setChart();
</script>

<div
	id={chartViewElementId}
	class="mt-2 min-h-96 rounded-lg border-2 border-dotted border-pink-200"
	style="position: relative;"
/>

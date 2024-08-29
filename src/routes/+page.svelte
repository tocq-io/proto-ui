<script lang="ts">
	import DataHeader from '$lib/ui/data-header.svelte';
	import DataAnalyzer from '$lib/ui/data-analyzer.svelte';
	import FileSelect from '$lib/ui/modals/file-select.svelte';
	import { SvelteFlowProvider } from '@xyflow/svelte';
</script>

<main>
	<DataHeader />
	<section>
		<FileSelect />
	</section>
	<SvelteFlowProvider>
		<DataAnalyzer />
	</SvelteFlowProvider>
</main>

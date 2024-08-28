<script lang="ts">
	import DataHeader from '$lib/ui/data-header.svelte';
	import DataAnalyzer from '$lib/ui/data-analyzer.svelte';
	import DataFooter from '$lib/ui/data-footer.svelte';
	import FileSelect from '$lib/ui/modals/file-select.svelte';
	import TablePreview from '$lib/ui/modals/table-preview.svelte';
	import { SvelteFlowProvider } from '@xyflow/svelte';
</script>

<main>
	<DataHeader />
	<section>
		<FileSelect />
		<TablePreview />
	</section>
	<SvelteFlowProvider>
		<DataAnalyzer />
	</SvelteFlowProvider>
	<DataFooter />
</main>

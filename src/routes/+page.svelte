<script lang="ts">
	import DataHeader from '$lib/ui/data-header.svelte';
	import DataAnalyzer from '$lib/ui/data-analyzer.svelte';
	import FileSelect from '$lib/ui/modals/file-select.svelte';
	import DataFooter from '$lib/ui/data-footer.svelte';
</script>

<main>
	<DataHeader />
	<section>
		<FileSelect />
	</section>
	<DataAnalyzer />
	<DataFooter />
</main>

<script lang="ts">
	import { Button, Fileupload, Modal } from 'flowbite-svelte';
	import { PlusOutline } from 'flowbite-svelte-icons';
	import { writeCsvFile } from '$lib/fileUtils';
	import { showDataUpload } from '$lib/storeUtils';

	let files: FileList;

	async function importFiles() {
		for (const file of files) {
			await writeCsvFile(file);
		}
	}
</script>

<Modal title="Upload CSV files" bind:open={$showDataUpload} autoclose class="min-w-full">
	<div class="mb-4 grid gap-4 sm:grid-cols-2">
		<div class="w-96">
			<Fileupload id="multiple_files" multiple bind:files />
		</div>
		<div class="text-right">
			<Button type="submit" class="w-44" on:click={() => importFiles()}>
				<PlusOutline class="mr-2 h-3.5 w-3.5" />Add new files
			</Button>
		</div>
	</div>
</Modal>

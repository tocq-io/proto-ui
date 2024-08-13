<script lang="ts">
	import { Button, Fileupload, Modal } from 'flowbite-svelte';
	import { PlusOutline } from 'flowbite-svelte-icons';
	import type { Writable } from 'svelte/store';
	import { writeCsvFile } from '$lib/fileUtils';
	import type { PreviewData } from '$lib/flowUtils';

	export let dataUploadModal: Writable<boolean>;
	export let dataView: Writable<PreviewData>;

	async function importFiles(files: FileList) {
		for (const file of files) {
			const fileName = file.name.replace(/\.[^/.]+$/, '');
			writeCsvFile(file, fileName, dataView);
		}
	}

	let files: FileList;
</script>

<Modal title="Upload some files" bind:open={$dataUploadModal} autoclose class="min-w-full">
	<div class="mb-4 grid gap-4 sm:grid-cols-2">
		<div class="w-96">
			<Fileupload id="multiple_files" multiple bind:files />
		</div>
		<div class="text-right">
			<Button type="submit" class="w-44" on:click={() => importFiles(files)}>
				<PlusOutline class="mr-2 h-3.5 w-3.5" />Add new files
			</Button>
		</div>
	</div>
</Modal>

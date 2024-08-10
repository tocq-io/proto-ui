<script lang="ts">
	import { Button, Fileupload, Modal } from 'flowbite-svelte';
	import { PlusOutline } from 'flowbite-svelte-icons';
	import type { Writable } from 'svelte/store';
	import { writeFile } from '$lib/fileUtils';
	import { addCsvNode } from '$lib/flowUtils';

	export let csvUploadModal: Writable<boolean>;

	async function importFiles(files: FileList) {
		for (const file of files) {
			const fileName = file.name.replace(/\.[^/.]+$/, '');
			const fileId = await writeFile(file, fileName);
			addCsvNode(fileId, fileName, file.size);
		}
	}

	let files: FileList;
</script>

<Modal title="Upload some files" bind:open={$csvUploadModal} autoclose class="min-w-full">
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

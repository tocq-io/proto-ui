<script lang="ts">
	import {
		Alert,
		Button,
		Card,
		Fileupload,
		Heading,
		Input,
		Label,
		Modal,
		Toggle
	} from 'flowbite-svelte';
	import { InfoCircleSolid, PlusOutline } from 'flowbite-svelte-icons';
	import { writeCsvFile } from '$lib/fileUtils';
	import { showDataUpload } from '$lib/storeUtils';
	import type { CsvConfig } from '$lib/dfSqlUtils';

	let files: FileList;

	let csvConfig: CsvConfig = {
		delimiter: ',',
		quote: '"',
		comment: '#',
		escape: '',
		null_regex: '(NA)|$^',
		truncated: false
	};

	async function importFiles() {
		for (const file of files) {
			await writeCsvFile(file, csvConfig);
		}
	}
</script>

<Modal title="Upload CSV files" bind:open={$showDataUpload} autoclose class="min-w-full">
	<div class="mb-8 mt-2 grid gap-4 sm:grid-cols-2">
		<div class="w-96">
			<Fileupload id="multiple_files" multiple bind:files />
		</div>
		<div class="text-right">
			<Button type="submit" class="w-44" on:click={() => importFiles()}>
				<PlusOutline class="mr-2 h-3.5 w-3.5" />Add new files
			</Button>
		</div>
	</div>
	<Card padding="sm" size="lg">
		<Heading tag="h6">Optional CSV format configuration</Heading>
		<div class="my-4 grid gap-4 sm:grid-cols-3">
			<div>
				<Label for="delimiter" class="text-xs">Delimiter (default: ',')</Label>
				<Input
					type="text"
					id="delimiter"
					bind:value={csvConfig.delimiter}
					size="sm"
					maxlength="1"
					required
				/>
			</div>
			<div>
				<Label for="quote" class="text-xs">Quote (default: '"')</Label>
				<Input type="text" id="quote" bind:value={csvConfig.quote} size="sm" maxlength="1" />
			</div>
			<div>
				<Label for="comment" class="text-xs">Comment (default: '#')</Label>
				<Input type="text" id="comment" bind:value={csvConfig.comment} size="sm" maxlength="1" />
			</div>
			<div>
				<Label for="escape" class="text-xs">Excape (default: 'none')</Label>
				<Input type="text" id="escape" bind:value={csvConfig.escape} size="sm" maxlength="1" />
			</div>
			<div>
				<Label for="nullRegex" class="text-xs">Null Regex (default: '(NA)|$^')</Label>
				<Input
					type="text"
					id="nullRegex"
					size="sm"
					bind:value={csvConfig.null_regex}
					maxlength="32"
				/>
			</div>
			<Toggle size="small" id="truncated" class="mt-4" bind:checked={csvConfig.truncated}
				>Truncated Rows</Toggle
			>
		</div>

		<Alert color="green" class="mt-2 p-0.5">
			<InfoCircleSolid slot="icon" class="h-4 w-4" />
			<span class="text-md"
				>The CSV file needs a header to import it meaningfully as table with Apache Arrow.</span
			>
		</Alert>
	</Card>
</Modal>

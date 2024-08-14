<script>
	import { Button } from 'flowbite-svelte';
	import { PlayOutline } from 'flowbite-svelte-icons';
</script>

<section class="pt-3">
	<div class="mb-4 grid gap-4 text-center sm:grid-cols-3">
		<span />
		<div>
			<Button class="h-4/5" disabled>
				<PlayOutline strokeWidth="4" class="mr-2 h-3.5 w-3.5" /><span class="text-lg">Publish</span>
			</Button>
			<Button class="h-4/5" disabled>
				<PlayOutline strokeWidth="4" class="mr-2 h-3.5 w-3.5" /><span class="text-lg">Share</span>
			</Button>
			<Button class="h-4/5" disabled>
				<PlayOutline strokeWidth="4" class="mr-2 h-3.5 w-3.5" /><span class="text-lg">Deploy</span>
			</Button>
		</div>
		<span />
	</div>
</section>

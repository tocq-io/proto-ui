<script lang="ts">
	import { onMount } from 'svelte';
	import { basicSetup, EditorView } from 'codemirror';
	import { javascript } from '@codemirror/lang-javascript';
	import { type Writable } from 'svelte/store';

	export let jsText: Writable<string>;
	export let jsEditorElementId: string;

	onMount(async () => {
		const targetElement = document.getElementById(jsEditorElementId)!;
		new EditorView({
			doc: $jsText,
			extensions: [
				basicSetup,
				javascript(),
				EditorView.updateListener.of(function (e) {
					if (e.docChanged) {
						$jsText = e.state.doc.toString();
					}
				})
			],
			parent: targetElement
		});
	});
</script>

<div id={jsEditorElementId}></div>

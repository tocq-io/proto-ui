<script lang="ts">
	import { onMount } from 'svelte';
	import { basicSetup, EditorView } from 'codemirror';
	import { sql } from '@codemirror/lang-sql';
	import { type Writable } from 'svelte/store';

	export let sqlText: Writable<string>;
	export let sqlEditorElementId: string;

	onMount(async () => {
		const targetElement = document.getElementById(sqlEditorElementId)!;
		new EditorView({
			doc: $sqlText,
			extensions: [
				basicSetup,
				sql(),
				EditorView.updateListener.of(function (e) {
					if (e.docChanged) {
						$sqlText = e.state.doc.toString();
					}
				})
			],
			parent: targetElement
		});
	});
</script>

<div id={sqlEditorElementId}></div>

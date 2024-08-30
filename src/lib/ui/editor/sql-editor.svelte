<script lang="ts">
    import { onMount } from 'svelte';
	import { basicSetup, EditorView } from 'codemirror';
    import { sql } from '@codemirror/lang-sql';
	import { type Writable } from 'svelte/store';

    let view: EditorView;
    export let codeText: Writable<string>;
    export let editorElementId: string;

    onMount(async () => {
        const targetElement = document.getElementById(editorElementId)!;
        view = new EditorView({
            doc: $codeText,
            extensions: [basicSetup, sql(), 
                EditorView.updateListener.of(function(e) {
                    if (e.docChanged) {
                        $codeText = e.state.doc.toString();
                    } 
                })
            ],
            parent: targetElement
        });
    });
</script>
<div id={editorElementId}></div>

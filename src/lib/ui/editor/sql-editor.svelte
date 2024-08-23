<script lang="ts">
    import { onMount } from 'svelte';
	import { basicSetup, EditorView } from 'codemirror';
    import { sql } from '@codemirror/lang-sql';
	import { type Writable } from 'svelte/store';
	import { sqlEditControl } from '$lib/storeUtils';

    let view: EditorView;
    export let codeText: Writable<string>;

    onMount(async () => {
        const targetElement = document.querySelector('#editor')!;
        $codeText = $sqlEditControl.sql;
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
<div id="editor"></div>

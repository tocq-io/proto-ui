<script lang="ts">
    import { onMount } from 'svelte';
	import { basicSetup, EditorView } from 'codemirror';
    import { sql } from '@codemirror/lang-sql';
	import { sqlEditControl } from '$lib/storeUtils';

    const initialText = $sqlEditControl.sql || 'Select * from world';
    let view: EditorView;

    onMount(async () => {
        const targetElement = document.querySelector('#editor')!;
        view = new EditorView({
            doc: initialText,
            extensions: [basicSetup, sql(), 
                EditorView.updateListener.of(function(e) {
                    if (e.docChanged) {
                        $sqlEditControl.sql = e.state.doc.toString();
                    } 
                })
            ],
            parent: targetElement
        });
    });
</script>
<div id="editor"></div>

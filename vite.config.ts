import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import wasm from 'vite-plugin-wasm';
import wasmPack from 'vite-plugin-wasm-pack';

export default defineConfig({
	plugins: [wasm(), sveltekit(), wasmPack('./proto-query-engine')],
	optimizeDeps: {
		exclude: ['@surrealdb/wasm', 'surrealql.wasm', 'surrealdb.wasm'],
		esbuildOptions: {
			target: 'esnext',
		},
	},
	// esbuild: {
	// 	supported: {
	// 		'top-level-await': true
	// 	},
	// },
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	build: {
		target: 'esnext'
	}
});

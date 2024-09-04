import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import wasm from 'vite-plugin-wasm';

export default defineConfig({
	plugins: [wasm(), sveltekit()],
	optimizeDeps: {
		exclude: ['surrealdb.wasm', '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm', '@duckdb/duckdb-wasm/dist/duckdb-coi.wasm'],
		esbuildOptions: {
			target: 'esnext',
		},
	},
	server: {
		headers: {
			"Cross-Origin-Opener-Policy": "same-origin",
			"Cross-Origin-Embedder-Policy": "require-corp"
		},
		cors: false,
	},
	worker: {
		format: 'es',
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

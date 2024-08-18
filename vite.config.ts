import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import wasm from 'vite-plugin-wasm';

export default defineConfig({
	plugins: [wasm(), sveltekit()],
	optimizeDeps: {
		exclude: ['surrealdb.wasm', './proto-query-engine'],
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

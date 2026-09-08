import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	ssr: {
		// Bundle the element-js packages into the server build so the DOM shim's side effect
		// stays ordered ahead of the component classes' `extends HTMLElement` evaluation
		// (see src/hooks.server.ts).
		noExternal: [
			'@webtides/element-js',
			'@webtides/element-js-ssr-renderer',
			'@webtides/element-library'
		]
	},
	test: {
		include: ['src/**/*.test.ts']
	}
});

import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	ssr: {
		// Bundle these into the server build instead of leaving them as hoisted
		// external imports, so the dom-shim's side effect (installing HTMLElement
		// etc.) stays ordered ahead of any `class … extends HTMLElement` component
		// module evaluation — see src/hooks.server.ts.
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

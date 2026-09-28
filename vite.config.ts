import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, lazyPlugins } from 'vite-plus';

export default defineConfig({
	plugins: lazyPlugins(() => [tailwindcss(), sveltekit()]),
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
	},
	// Oxlint sees the <script> of .svelte files only; templates are covered by svelte-check.
	lint: {
		ignorePatterns: ['build/', '.svelte-kit/', 'dist/', 'drizzle/'],
		env: { browser: true, node: true },
		categories: { correctness: 'error' },
		// ESLint and typescript-eslint "recommended" rules that sit outside Oxlint's correctness category.
		rules: {
			'no-array-constructor': 'error',
			'no-case-declarations': 'error',
			'no-empty': 'error',
			'no-fallthrough': 'error',
			'no-prototype-builtins': 'error',
			'no-regex-spaces': 'error',
			'no-unexpected-multiline': 'error',
			'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
			'no-var': 'error',
			'prefer-const': 'error',
			'prefer-rest-params': 'error',
			'prefer-spread': 'error',
			'preserve-caught-error': 'error',
			'typescript/ban-ts-comment': 'error',
			'typescript/no-empty-object-type': 'error',
			'typescript/no-explicit-any': 'error',
			'typescript/no-namespace': 'error',
			'typescript/no-require-imports': 'error',
			'typescript/no-unnecessary-type-constraint': 'error',
			'typescript/no-unsafe-function-type': 'error',
			'vite-plus/prefer-vite-plus-imports': 'error'
		},
		options: { typeAware: true, typeCheck: true },
		jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }]
	},
	fmt: {
		useTabs: true,
		singleQuote: true,
		trailingComma: 'none',
		printWidth: 100,
		sortPackageJson: false,
		svelte: {},
		// The loop workflow is rolled out verbatim from agent-loop/snippets; leave its formatting alone.
		ignorePatterns: [
			'.svelte-kit',
			'build',
			'drizzle',
			'playwright-report',
			'test-results',
			'package-lock.json',
			'.github/workflows/agent.yml'
		]
	}
});

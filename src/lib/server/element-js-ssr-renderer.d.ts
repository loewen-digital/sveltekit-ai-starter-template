// UPSTREAM: https://github.com/webtides/element-js-ssr-renderer/issues/13
// The package ships no .d.ts files, so strict/checkJs TypeScript can't infer
// `elementSSR`'s type. Typed loosely as `Handle` (its actual shape) until
// upstream ships declarations.
declare module '@webtides/element-js-ssr-renderer/sveltekit' {
	import type { Handle } from '@sveltejs/kit';

	export function elementSSR(options?: {
		resolve?: unknown;
		onUnresolved?: (tag: string) => void;
		exclude?: string[] | ((tag: string) => boolean);
		onError?: (tag: string, error: Error) => void;
		serializeState?: boolean;
		transforms?: unknown;
		properties?: unknown;
	}): Handle;
}

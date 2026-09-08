// Declarations for subpath exports that ship without types.
// UPSTREAM: https://github.com/webtides/element-js-ssr-renderer/issues/13

declare module '@webtides/element-js-ssr-renderer/dom-shim';

declare module '@webtides/element-js-ssr-renderer/sveltekit' {
	import type { Handle } from '@sveltejs/kit';

	type PageTransform = (html: string, context: Record<string, unknown>) => string | Promise<string>;

	export function elementSSR(options?: {
		resolve?: unknown;
		exclude?: string[] | ((tag: string) => boolean);
		onUnresolved?: (tag: string) => void;
		onError?: (tag: string, error: Error) => void;
		serializeState?: boolean;
		transforms?: { pre?: PageTransform | PageTransform[]; post?: PageTransform | PageTransform[] };
		properties?: (input: {
			tag: string;
			node: { hasAttribute(name: string): boolean; getAttribute(name: string): string | undefined };
			context: unknown;
		}) => object | null | undefined | Promise<object | null | undefined>;
	}): Handle;
}

declare module '@webtides/element-js-ssr-renderer/autoloader' {
	export function autoload(options: {
		resolve: object | object[];
		eager?: boolean;
		root?: Element | Document;
	}): { load: (tag: string) => Promise<void>; stop: () => void };
}

// UPSTREAM: https://github.com/webtides/element-library/issues/85
declare module '@webtides/element-library/catalog' {
	const catalog: Record<string, () => Promise<{ default: CustomElementConstructor }>>;
	export default catalog;
}

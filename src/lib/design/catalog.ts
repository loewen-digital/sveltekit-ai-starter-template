import catalog from '@webtides/element-library/catalog';

/**
 * One SSR configuration per element-library tag. The renderer reads it on the
 * server, the autoloader (see autoload.ts) on the client.
 */
export type ElementConfig = {
	component: () => Promise<unknown>;
	/** Document stylesheets to copy into the shadow root. Off: components style themselves. */
	adoptGlobalStyles: boolean;
	/** Extra CSS injected ahead of the component's own styles, server-side only. */
	styles?: string[];
};

/**
 * The single tag → module map for both sides. Library components style
 * themselves through the `--el-*` tokens, which inherit into shadow roots as
 * custom properties, so none of them needs the document's stylesheets adopted
 * into every shadow root (which would inline Tailwind once per component).
 */
export const elementCatalog: Record<string, ElementConfig> = Object.fromEntries(
	Object.entries(catalog).map(([tag, component]) => [tag, { component, adoptGlobalStyles: false }])
);

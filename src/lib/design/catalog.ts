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
 * Per-component CSS the renderer injects into the Declarative Shadow DOM,
 * ahead of the component's own styles.
 *
 * UPSTREAM: https://github.com/webtides/element-library/issues/87
 * el-notification keeps its panel at opacity 0 until its JavaScript adds
 * `.showing`, so a server-rendered open notification is invisible before the
 * element upgrades, and forever without scripting. Until the element has
 * connected (element-js adds the `connected` state then), show the resting
 * state; afterwards the element's own transition classes take over.
 */
const ssrStyles: Record<string, string[] | undefined> = {
	'el-notification': [
		":host(:not(:state(connected))) [part~='base'] { opacity: 1; transform: none; }"
	]
};

/**
 * The single tag → module map for both sides. Library components style
 * themselves through the `--el-*` tokens, which inherit into shadow roots as
 * custom properties, so none of them needs the document's stylesheets adopted
 * into every shadow root (which would inline Tailwind once per component).
 */
export const elementCatalog: Record<string, ElementConfig> = Object.fromEntries(
	Object.entries(catalog).map(([tag, component]) => [
		tag,
		{ component, adoptGlobalStyles: false, styles: ssrStyles[tag] }
	])
);

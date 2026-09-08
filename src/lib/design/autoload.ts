import { autoload } from '@webtides/element-js-ssr-renderer/autoloader';
import { elementCatalog } from './catalog.js';

let started = false;

/**
 * Loads and defines every element-library component found on the page, once
 * on the client. Elements added later (client-side navigation, conditional
 * markup) are picked up by the autoloader's MutationObserver. The
 * server-rendered ones hydrate from their Declarative Shadow DOM on upgrade.
 */
export function autoloadElements(): void {
	if (started) return;
	started = true;
	autoload({ resolve: elementCatalog });
}

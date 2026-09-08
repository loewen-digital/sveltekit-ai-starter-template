import type { Handle, ServerInit } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { authHandle } from '$lib/features/auth/server/middleware.js';
import { elementCatalog } from '$lib/design/catalog.js';

let elementHandle: Handle;

// Pre-renders every element-library component on the page (Declarative Shadow
// DOM for shadow components, in place for light-DOM ones), so the client
// hydrates them instead of rendering from scratch. Only the tags actually on a
// page are loaded.
//
// The renderer's DOM shim has to be evaluated before element-js, whose classes
// extend HTMLElement at module-evaluation time. A static import order does not
// survive the production build (Rollup hoists the shared element-js chunk above
// the entry's own code), so both modules load here, awaited in order, once
// before the first request.
export const init: ServerInit = async () => {
	await import('@webtides/element-js-ssr-renderer/dom-shim');
	const { elementSSR } = await import('@webtides/element-js-ssr-renderer/sveltekit');
	elementHandle = elementSSR({ resolve: elementCatalog });
};

// Rate limiting lives in the auth form actions (see rate-limit-guard.ts), not
// here, so it can return a form-level failure instead of a raw 429 response.
export const handle = sequence(authHandle, (input) => elementHandle(input));

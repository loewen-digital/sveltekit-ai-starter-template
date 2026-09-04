// The DOM shim must be imported before any @webtides/element-js component
// module: component classes are `class … extends HTMLElement`, evaluated at
// import time, so HTMLElement (and friends) must exist on globalThis first.
import '@webtides/element-js-ssr-renderer/dom-shim';

import { sequence } from '@sveltejs/kit/hooks';
import { elementSSR } from '@webtides/element-js-ssr-renderer/sveltekit';
import Button from '@webtides/element-library/button';
import { authHandle } from '$lib/features/auth/server/middleware.js';

// Pre-renders @webtides/element-js custom elements (Declarative Shadow DOM for
// shadow components) so they hydrate on the client instead of rendering from
// scratch. `resolve` starts with a single eagerly-resolved component; add more
// (or switch to `@webtides/element-library/catalog` for lazy, on-demand
// loading) as element-library components replace src/lib/design/components/*.
const elementSSRHandle = elementSSR({
	resolve: [{ 'el-button': Button }]
});

// Rate limiting lives in the auth form actions (see rate-limit-guard.ts), not
// here, so it can return a form-level failure instead of a raw 429 response.
export const handle = sequence(authHandle, elementSSRHandle);

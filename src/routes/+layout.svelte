<script module lang="ts">
	import { browser } from '$app/environment';
	import { autoload } from '@webtides/element-js-ssr-renderer/autoloader';
	import { elementCatalog } from '$lib/design/catalog.js';

	// Loads and defines the element-library components found on the page, and
	// any added later by client-side navigation. Runs once, from the app
	// bundle, ahead of hydration, so the server-rendered elements upgrade early.
	if (browser) autoload({ resolve: elementCatalog });
</script>

<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

{@render children()}

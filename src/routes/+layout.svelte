<script module lang="ts">
	import { browser } from '$app/environment';
	import { autoloadElements } from '$lib/design/autoload.js';

	// Starts loading the element-library components as soon as the app bundle
	// runs, ahead of hydration, so the server-rendered elements upgrade early.
	if (browser) autoloadElements();
</script>

<script lang="ts">
	import '../app.css';
	import { ToastContainer } from '$lib/design/components';

	let { children } = $props();
</script>

{@render children()}
<ToastContainer />

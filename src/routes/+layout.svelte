<script lang="ts">
	import '../app.css';
	// Global (unscoped) CSS: Svelte's scoped <style> can't reach the shadow
	// roots that shadow-rendered element-js components use.
	import '@webtides/element-library/themes/default.css';
	import '$lib/design/element-theme.css';
	import { onMount } from 'svelte';
	import { ToastContainer } from '$lib/design/components';

	let { children } = $props();

	onMount(async () => {
		// Client-only: `/define` calls `customElements.define`, so it must not
		// load during SSR. The server already rendered these tags (see
		// src/hooks.server.ts); this upgrades and hydrates them in place.
		await import('@webtides/element-library/button/define');
	});
</script>

{@render children()}
<ToastContainer />

<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { ToastContainer } from '$lib/design/components';
	import { autoloadElements } from '$lib/design/autoload.js';

	let { children } = $props();

	// Upgrades the server-rendered element-library components; runs once for
	// the whole app since the root layout never remounts.
	onMount(() => autoloadElements());
</script>

{@render children()}
<ToastContainer />

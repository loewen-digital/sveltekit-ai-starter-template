<script lang="ts">
	import { Card } from '$lib/design/components';

	let { data } = $props();
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<Card>
	<h1 class="text-2xl font-bold text-fg">Welcome, {data.user.email}</h1>
	<p class="mt-2 text-fg-muted">You are logged in.</p>
</Card>

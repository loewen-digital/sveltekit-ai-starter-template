<script lang="ts">
	import { Card } from '$lib/design/components';

	let { data } = $props();
</script>

<Card>
	<h1 class="text-2xl font-bold text-text-primary">Welcome, {data.user.email}</h1>
	<p class="mt-2 text-text-secondary">You are logged in.</p>
</Card>

<script lang="ts">
	import { Card } from '$lib/design/components';

	let { data } = $props();
</script>

<svelte:head>
	<title>Email Verification</title>
</svelte:head>

<main class="flex min-h-screen items-center justify-center px-4">
	<div class="w-full max-w-md">
		<Card>
			<h1 class="mb-6 text-center text-2xl font-bold text-fg">Email Verification</h1>

			{#if data.error}
				<el-notification variant="danger" open role="alert">{data.error}</el-notification>
				<p class="mt-4 text-center text-sm text-fg-muted">
					<a href="/login" class="text-accent hover:underline">Go to Login</a>
				</p>
			{:else}
				<el-notification variant="success" open role="status">
					Your email has been verified successfully.
				</el-notification>
				<p class="mt-4 text-center text-sm text-fg-muted">
					<a href="/" class="text-accent hover:underline">Continue to App</a>
				</p>
			{/if}
		</Card>
	</div>
</main>

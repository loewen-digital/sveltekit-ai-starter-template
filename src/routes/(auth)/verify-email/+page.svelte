<script lang="ts">
	import { Alert, Card } from '$lib/design/components';

	let { data } = $props();
</script>

<div class="flex min-h-screen items-center justify-center px-4">
	<div class="w-full max-w-md">
		<Card>
			<h1 class="mb-6 text-center text-2xl font-bold text-text-primary">Email Verification</h1>

			{#if data.error}
				<Alert variant="danger">{data.error}</Alert>
				<p class="mt-4 text-center text-sm text-text-secondary">
					<a href="/login" class="text-primary hover:underline">Go to Login</a>
				</p>
			{:else}
				<Alert variant="success">Your email has been verified successfully.</Alert>
				<p class="mt-4 text-center text-sm text-text-secondary">
					<a href="/" class="text-primary hover:underline">Continue to App</a>
				</p>
			{/if}
		</Card>
	</div>
</div>

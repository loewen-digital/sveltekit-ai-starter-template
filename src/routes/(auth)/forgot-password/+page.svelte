<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Input, Alert, Card } from '$lib/design/components';

	let { form } = $props();

	let email = $state('');
	let loading = $state(false);
</script>

<div class="flex min-h-screen items-center justify-center px-4">
	<div class="w-full max-w-md">
		<Card>
			<h1 class="mb-2 text-center text-2xl font-bold text-text-primary">Forgot Password</h1>
			<p class="mb-6 text-center text-sm text-text-secondary">
				Enter your email and we'll send you a reset link.
			</p>

			{#if form?.success}
				<div class="mb-4">
					<Alert variant="success">
						If an account with that email exists, we've sent a password reset link.
					</Alert>
				</div>
			{/if}

			<form
				method="POST"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						loading = false;
						await update();
					};
				}}
				class="flex flex-col gap-4"
			>
				<Input type="email" label="Email" name="email" bind:value={email} required />
				<Button type="submit" variant="primary" {loading}>Send Reset Link</Button>
			</form>

			<p class="mt-4 text-center text-sm text-text-secondary">
				<a href="/login" class="text-primary hover:underline">Back to Login</a>
			</p>
		</Card>
	</div>
</div>

<script lang="ts">
	import { enhance } from '$app/forms';
	import { Card, SubmitButton } from '$lib/design/components';

	let { form } = $props();

	let loading = $state(false);

	let error = $derived(form?.error || '');
</script>

<svelte:head>
	<title>Forgot Password</title>
</svelte:head>

<main class="flex min-h-screen items-center justify-center px-4">
	<div class="w-full max-w-md">
		<Card>
			<h1 class="mb-2 text-center text-2xl font-bold text-fg">Forgot Password</h1>
			<p class="mb-6 text-center text-sm text-fg-muted">
				Enter your email and we'll send you a reset link.
			</p>

			{#if error}
				<div class="mb-4">
					<el-notification variant="danger" open role="alert">{error}</el-notification>
				</div>
			{:else if form?.success}
				<div class="mb-4">
					<el-notification variant="success" open role="status">
						If an account with that email exists, we've sent a password reset link.
					</el-notification>
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
				<el-input-field type="email" name="email" label="Email" required></el-input-field>
				<SubmitButton variant="primary" {loading}>Send Reset Link</SubmitButton>
			</form>

			<p class="mt-4 text-center text-sm text-fg-muted">
				<a href="/login" class="text-accent hover:underline">Back to Login</a>
			</p>
		</Card>
	</div>
</main>

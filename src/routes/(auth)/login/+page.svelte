<script lang="ts">
	import { enhance } from '$app/forms';
	import { Card, SubmitButton } from '$lib/design/components';

	let { form } = $props();

	let loading = $state(false);

	let error = $derived(form?.error || '');
</script>

<svelte:head>
	<title>Login</title>
</svelte:head>

<main class="flex min-h-screen items-center justify-center px-4">
	<div class="w-full max-w-md">
		<Card>
			<h1 class="mb-6 text-center text-2xl font-bold text-text-primary">Login</h1>

			{#if error}
				<div class="mb-4">
					<el-notification variant="danger" open role="alert">{error}</el-notification>
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
				<el-password-field name="password" label="Password" required></el-password-field>
				<SubmitButton variant="primary" {loading}>Login</SubmitButton>
			</form>

			<p class="mt-4 text-center text-sm text-text-secondary">
				<a href="/forgot-password" class="text-primary hover:underline">Forgot password?</a>
			</p>
			<p class="mt-2 text-center text-sm text-text-secondary">
				Don't have an account? <a href="/register" class="text-primary underline">Register</a>
			</p>
		</Card>
	</div>
</main>

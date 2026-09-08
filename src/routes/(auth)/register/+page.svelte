<script lang="ts">
	import { enhance } from '$app/forms';
	import { Card, SubmitButton } from '$lib/design/components';
	import { validateRegistration } from '$lib/shared/validation.js';

	let { form } = $props();

	let clientError = $state('');
	let loading = $state(false);

	let error = $derived(clientError || form?.error || '');
</script>

<svelte:head>
	<title>Create Account</title>
</svelte:head>

<main class="flex min-h-screen items-center justify-center px-4">
	<div class="w-full max-w-md">
		<Card>
			<h1 class="mb-6 text-center text-2xl font-bold text-text-primary">Create Account</h1>

			{#if error}
				<div class="mb-4">
					<el-notification variant="danger" open role="alert">{error}</el-notification>
				</div>
			{/if}

			<form
				method="POST"
				use:enhance={({ formData, cancel }) => {
					const err = validateRegistration({
						email: String(formData.get('email') ?? ''),
						password: String(formData.get('password') ?? ''),
						passwordConfirm: String(formData.get('passwordConfirm') ?? '')
					});
					if (err) {
						clientError = err;
						cancel();
						return;
					}
					clientError = '';
					loading = true;
					return async ({ update }) => {
						loading = false;
						await update();
					};
				}}
				class="flex flex-col gap-4"
			>
				<el-input-field type="email" name="email" label="Email" required></el-input-field>
				<el-password-field name="password" label="Password" placeholder="Min. 8 characters" required
				></el-password-field>
				<el-password-field name="passwordConfirm" label="Confirm Password" required
				></el-password-field>
				<SubmitButton variant="primary" {loading}>Register</SubmitButton>
			</form>

			<p class="mt-4 text-center text-sm text-text-secondary">
				Already have an account? <a href="/login" class="text-primary underline">Login</a>
			</p>
		</Card>
	</div>
</main>

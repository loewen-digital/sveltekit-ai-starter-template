<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Input, Alert, Card } from '$lib/design/components';

	let { form } = $props();

	let email = $state('');
	let password = $state('');
	let passwordConfirm = $state('');
	let clientError = $state('');
	let loading = $state(false);

	function validate(): string {
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email address';
		if (password.length < 8) return 'Password must be at least 8 characters';
		if (password !== passwordConfirm) return 'Passwords do not match';
		return '';
	}

	let error = $derived(clientError || form?.error || '');
</script>

<div class="flex min-h-screen items-center justify-center px-4">
	<div class="w-full max-w-md">
		<Card>
			<h1 class="mb-6 text-center text-2xl font-bold text-text-primary">Create Account</h1>

			{#if error}
				<div class="mb-4">
					<Alert variant="danger">{error}</Alert>
				</div>
			{/if}

			<form
				method="POST"
				use:enhance={({ cancel }) => {
					const err = validate();
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
				<Input type="email" label="Email" name="email" bind:value={email} required />
				<Input
					type="password"
					label="Password"
					name="password"
					placeholder="Min. 8 characters"
					bind:value={password}
					required
				/>
				<Input
					type="password"
					label="Confirm Password"
					name="passwordConfirm"
					bind:value={passwordConfirm}
					required
				/>
				<Button type="submit" variant="primary" {loading}>Register</Button>
			</form>

			<p class="mt-4 text-center text-sm text-text-secondary">
				Already have an account? <a href="/login" class="text-primary hover:underline">Login</a>
			</p>
		</Card>
	</div>
</div>

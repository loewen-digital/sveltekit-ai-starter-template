<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Input, Alert, Card } from '$lib/design/components';

	let { form } = $props();

	let email = $state('');
	let password = $state('');
	let loading = $state(false);

	let error = $derived(form?.error || '');
</script>

<div class="flex min-h-screen items-center justify-center px-4">
	<div class="w-full max-w-md">
		<Card>
			<h1 class="mb-6 text-center text-2xl font-bold text-text-primary">Login</h1>

			{#if error}
				<div class="mb-4">
					<Alert variant="danger">{error}</Alert>
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
				<Input type="password" label="Password" name="password" bind:value={password} required />
				<Button type="submit" variant="primary" {loading}>Login</Button>
			</form>

			<p class="mt-4 text-center text-sm text-text-secondary">
				Don't have an account? <a href="/register" class="text-primary hover:underline">Register</a>
			</p>
		</Card>
	</div>
</div>

<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Input, Alert, Card } from '$lib/design/components';
	import { validateEmail } from '$lib/shared/validation.js';
	import { addToast } from '$lib/features/toast/toast.svelte.js';

	let {
		currentEmail,
		form
	}: { currentEmail: string; form: Record<string, unknown> | null } = $props();

	let email = $state('');

	$effect(() => {
		email = currentEmail;
	});
	let password = $state('');
	let clientError = $state('');
	let loading = $state(false);

	function validate(): string {
		return validateEmail(email) ?? '';
	}

	let error = $derived(clientError || (form?.emailError as string) || '');
</script>

<Card>
	<h2 class="mb-4 text-lg font-bold text-text-primary">Change Email</h2>

	{#if error}
		<div class="mb-4">
			<Alert variant="danger">{error}</Alert>
		</div>
	{/if}

	<form
		method="POST"
		action="?/updateEmail"
		use:enhance={({ cancel }) => {
			const err = validate();
			if (err) {
				clientError = err;
				cancel();
				return;
			}
			clientError = '';
			loading = true;
			return async ({ result, update }) => {
				loading = false;
				if (result.type === 'success') {
					password = '';
					addToast({ message: 'Email updated successfully', variant: 'success' });
				}
				await update();
			};
		}}
		class="flex flex-col gap-4"
	>
		<Input type="email" label="New Email" name="email" bind:value={email} required />
		<Input
			type="password"
			label="Current Password"
			name="password"
			bind:value={password}
			required
		/>
		<Button type="submit" variant="primary" {loading}>Update Email</Button>
	</form>
</Card>

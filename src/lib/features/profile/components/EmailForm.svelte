<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Input, Alert, Card } from '$lib/design/components';
	import { validateEmail } from '$lib/shared/validation.js';

	let { currentEmail, form }: { currentEmail: string; form: Record<string, unknown> | null } =
		$props();

	// Seeded from the prop rather than synced via $effect: effects do not run
	// during SSR, so an effect would leave the field empty in the server-rendered
	// HTML and then overwrite whatever the user typed once hydration lands.
	// Capturing the initial value is intentional — the field belongs to the user
	// from first paint onwards, and a rejected submit must keep what they typed.
	// svelte-ignore state_referenced_locally
	let email = $state(currentEmail);
	let password = $state('');
	let clientError = $state('');
	let loading = $state(false);

	function validate(): string {
		return validateEmail(email) ?? '';
	}

	let error = $derived(clientError || (form?.emailError as string) || '');
	let success = $derived((form?.emailSuccess as string) || '');
</script>

<Card>
	<h2 class="mb-4 text-lg font-bold text-text-primary">Change Email</h2>

	{#if error}
		<div class="mb-4">
			<Alert variant="danger">{error}</Alert>
		</div>
	{:else if success}
		<!-- The server's message, so the result also shows without JavaScript. -->
		<div class="mb-4">
			<Alert variant="success">{success}</Alert>
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

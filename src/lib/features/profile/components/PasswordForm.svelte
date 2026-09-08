<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Input, Alert, Card } from '$lib/design/components';
	import { validatePassword, validatePasswordConfirm } from '$lib/shared/validation.js';

	let { form }: { form: Record<string, unknown> | null } = $props();

	let currentPassword = $state('');
	let newPassword = $state('');
	let newPasswordConfirm = $state('');
	let clientError = $state('');
	let loading = $state(false);

	function validate(): string {
		return (
			validatePassword(newPassword) ??
			validatePasswordConfirm(newPassword, newPasswordConfirm) ??
			''
		);
	}

	let error = $derived(clientError || (form?.passwordError as string) || '');
	let success = $derived((form?.passwordSuccess as string) || '');
</script>

<Card>
	<h2 class="mb-4 text-lg font-bold text-text-primary">Change Password</h2>

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
		action="?/updatePassword"
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
					currentPassword = '';
					newPassword = '';
					newPasswordConfirm = '';
				}
				await update();
			};
		}}
		class="flex flex-col gap-4"
	>
		<Input
			type="password"
			label="Current Password"
			name="currentPassword"
			bind:value={currentPassword}
			required
		/>
		<Input
			type="password"
			label="New Password"
			name="newPassword"
			placeholder="Min. 8 characters"
			bind:value={newPassword}
			required
		/>
		<Input
			type="password"
			label="Confirm New Password"
			name="newPasswordConfirm"
			bind:value={newPasswordConfirm}
			required
		/>
		<Button type="submit" variant="primary" {loading}>Update Password</Button>
	</form>
</Card>

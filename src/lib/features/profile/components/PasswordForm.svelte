<script lang="ts">
	import { enhance } from '$app/forms';
	import { Card, SubmitButton } from '$lib/design/components';
	import { validatePassword, validatePasswordConfirm } from '$lib/shared/validation.js';

	let { form }: { form: Record<string, unknown> | null } = $props();

	let clientError = $state('');
	let loading = $state(false);

	let error = $derived(clientError || (form?.passwordError as string) || '');
	let success = $derived((form?.passwordSuccess as string) || '');
</script>

<Card>
	<h2 class="mb-4 text-lg font-bold text-text-primary">Change Password</h2>

	{#if error}
		<div class="mb-4">
			<el-notification variant="danger" open role="alert">{error}</el-notification>
		</div>
	{:else if success}
		<!-- The server's message, so the result also shows without JavaScript. -->
		<div class="mb-4">
			<el-notification variant="success" open role="status">{success}</el-notification>
		</div>
	{/if}

	<form
		method="POST"
		action="?/updatePassword"
		use:enhance={({ formData, cancel }) => {
			const newPassword = String(formData.get('newPassword') ?? '');
			const err =
				validatePassword(newPassword) ??
				validatePasswordConfirm(newPassword, String(formData.get('newPasswordConfirm') ?? '')) ??
				'';
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
		<el-password-field name="currentPassword" label="Current Password" required></el-password-field>
		<el-password-field
			name="newPassword"
			label="New Password"
			placeholder="Min. 8 characters"
			required
		></el-password-field>
		<el-password-field name="newPasswordConfirm" label="Confirm New Password" required
		></el-password-field>
		<SubmitButton variant="primary" {loading}>Update Password</SubmitButton>
	</form>
</Card>

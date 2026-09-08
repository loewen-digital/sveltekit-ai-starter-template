<script lang="ts">
	import { enhance } from '$app/forms';
	import { Card, SubmitButton } from '$lib/design/components';
	import { validateEmail } from '$lib/shared/validation.js';

	let { currentEmail, form }: { currentEmail: string; form: Record<string, unknown> | null } =
		$props();

	let clientError = $state('');
	let loading = $state(false);

	let error = $derived(clientError || (form?.emailError as string) || '');
	let success = $derived((form?.emailSuccess as string) || '');
</script>

<Card>
	<h2 class="mb-4 text-lg font-bold text-fg">Change Email</h2>

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
		action="?/updateEmail"
		use:enhance={({ formData, cancel }) => {
			const err = validateEmail(String(formData.get('email') ?? '')) ?? '';
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
		<el-input-field type="email" name="email" label="New Email" value={currentEmail} required
		></el-input-field>
		<el-password-field name="password" label="Current Password" required></el-password-field>
		<SubmitButton variant="primary" {loading}>Update Email</SubmitButton>
	</form>
</Card>

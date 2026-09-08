<script lang="ts">
	import { enhance } from '$app/forms';
	import { Card, SubmitButton } from '$lib/design/components';

	let { data, form } = $props();

	let loading = $state(false);

	let error = $derived(form?.error || '');
	let token = $derived(
		('token' in (form ?? {}) ? (form as { token?: string })?.token : null) || data.token
	);
</script>

<svelte:head>
	<title>Reset Password</title>
</svelte:head>

<main class="flex min-h-screen items-center justify-center px-4">
	<div class="w-full max-w-md">
		<Card>
			<h1 class="mb-6 text-center text-2xl font-bold text-text-primary">Reset Password</h1>

			{#if form?.success}
				<div class="mb-4">
					<el-notification variant="success" open role="status">
						Password reset successfully. You can now log in with your new password.
					</el-notification>
				</div>
				<p class="text-center">
					<a href="/login" class="text-primary hover:underline">Go to Login</a>
				</p>
			{:else}
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
					<input type="hidden" name="token" value={token} />
					<el-password-field
						name="password"
						label="New Password"
						placeholder="Min. 8 characters"
						required
					></el-password-field>
					<el-password-field name="passwordConfirm" label="Confirm Password" required
					></el-password-field>
					<SubmitButton variant="primary" {loading}>Reset Password</SubmitButton>
				</form>

				<p class="mt-4 text-center text-sm text-text-secondary">
					<a href="/login" class="text-primary hover:underline">Back to Login</a>
				</p>
			{/if}
		</Card>
	</div>
</main>

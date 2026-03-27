<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Input, Alert, Card } from '$lib/design/components';

	let { data, form } = $props();

	let password = $state('');
	let passwordConfirm = $state('');
	let loading = $state(false);

	let error = $derived(form?.error || '');
	let token = $derived(('token' in (form ?? {}) ? (form as { token?: string })?.token : null) || data.token);
</script>

<div class="flex min-h-screen items-center justify-center px-4">
	<div class="w-full max-w-md">
		<Card>
			<h1 class="mb-6 text-center text-2xl font-bold text-text-primary">Reset Password</h1>

			{#if form?.success}
				<div class="mb-4">
					<Alert variant="success">
						Password reset successfully. You can now log in with your new password.
					</Alert>
				</div>
				<p class="text-center">
					<a href="/login" class="text-primary hover:underline">Go to Login</a>
				</p>
			{:else}
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
					<input type="hidden" name="token" value={token} />
					<Input
						type="password"
						label="New Password"
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
					<Button type="submit" variant="primary" {loading}>Reset Password</Button>
				</form>

				<p class="mt-4 text-center text-sm text-text-secondary">
					<a href="/login" class="text-primary hover:underline">Back to Login</a>
				</p>
			{/if}
		</Card>
	</div>
</div>

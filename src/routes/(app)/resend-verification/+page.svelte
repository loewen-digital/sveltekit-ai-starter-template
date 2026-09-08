<script lang="ts">
	import { enhance } from '$app/forms';
	import { Card, SubmitButton } from '$lib/design/components';

	let { data, form } = $props();

	let loading = $state(false);
</script>

<svelte:head>
	<title>Email Verification</title>
</svelte:head>

<div class="mx-auto max-w-lg">
	<Card>
		<h1 class="mb-4 text-2xl font-bold text-fg">Email Verification</h1>

		{#if data.user?.emailVerified}
			<el-notification variant="success" open role="status">
				Your email is already verified.
			</el-notification>
		{:else if form?.success}
			<el-notification variant="success" open role="status">
				Verification email sent to {data.user?.email}. Please check your inbox.
			</el-notification>
		{:else}
			<!-- Delivery can fail, so the form stays available for a retry. -->
			{#if form?.error}
				<div class="mb-4">
					<el-notification variant="danger" open role="alert">{form.error}</el-notification>
				</div>
			{/if}
			<p class="mb-4 text-fg-muted">
				Your email ({data.user?.email}) is not yet verified. Click below to receive a new
				verification link.
			</p>
			<form
				method="POST"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						loading = false;
						await update();
					};
				}}
			>
				<SubmitButton variant="primary" {loading}>Resend Verification Email</SubmitButton>
			</form>
		{/if}
	</Card>
</div>

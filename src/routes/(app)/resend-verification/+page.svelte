<script lang="ts">
	import { enhance } from '$app/forms';
	import { Alert, Button, Card } from '$lib/design/components';

	let { data, form } = $props();

	let loading = $state(false);
</script>

<div class="mx-auto max-w-lg">
	<Card>
		<h1 class="mb-4 text-2xl font-bold text-text-primary">Email Verification</h1>

		{#if data.user?.emailVerified}
			<Alert variant="success">Your email is already verified.</Alert>
		{:else if form?.success}
			<Alert variant="success">
				Verification email sent to {data.user?.email}. Please check your inbox.
			</Alert>
		{:else}
			<!-- Delivery can fail, so the form stays available for a retry. -->
			{#if form?.error}
				<div class="mb-4">
					<Alert variant="danger">{form.error}</Alert>
				</div>
			{/if}
			<p class="mb-4 text-text-secondary">
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
				<Button type="submit" variant="primary" {loading}>Resend Verification Email</Button>
			</form>
		{/if}
	</Card>
</div>

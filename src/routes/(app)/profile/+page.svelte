<script lang="ts">
	import EmailForm from '$lib/features/profile/components/EmailForm.svelte';
	import PasswordForm from '$lib/features/profile/components/PasswordForm.svelte';

	let { data, form } = $props();
</script>

<div class="mx-auto max-w-lg">
	<h1 class="mb-6 text-2xl font-bold text-text-primary">Settings</h1>

	<div class="flex flex-col gap-6">
		<EmailForm currentEmail={data.user?.email ?? ''} {form} />
		<PasswordForm {form} />
	</div>
</div>

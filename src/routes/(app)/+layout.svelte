<script lang="ts">
	import LogoutButton from '$lib/features/auth/components/LogoutButton.svelte';

	let { data, children } = $props();

	let menuOpen = $state(false);
</script>

<div class="min-h-screen bg-bg">
	<nav class="border-b border-border bg-bg">
		<div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
			<a href="/" class="text-lg font-bold text-fg">SvelteKit Starter</a>

			<!-- Desktop -->
			<div class="hidden items-center gap-4 sm:flex">
				<span class="text-sm text-fg-muted">{data.user.email}</span>
				<a href="/profile" class="text-sm text-fg-muted hover:text-accent">Settings</a>
				<LogoutButton />
			</div>

			<!-- Mobile toggle -->
			<button class="text-fg sm:hidden" onclick={() => (menuOpen = !menuOpen)}>
				{#if menuOpen}
					✕
				{:else}
					☰
				{/if}
			</button>
		</div>

		<!-- Mobile menu -->
		{#if menuOpen}
			<div class="border-t border-border px-4 py-3 sm:hidden">
				<div class="flex flex-col gap-3">
					<div class="flex items-center justify-between">
						<span class="text-sm text-fg-muted">{data.user.email}</span>
						<LogoutButton />
					</div>
					<a href="/profile" class="text-sm text-fg-muted hover:text-accent">Settings</a>
				</div>
			</div>
		{/if}
	</nav>

	<main class="mx-auto max-w-7xl px-4 py-8">
		{#if !data.user.emailVerified}
			<div class="mb-6">
				<el-notification variant="warning" open role="alert">
					Your email is not verified.
					<a href="/resend-verification" class="font-medium underline">Resend verification email</a>
				</el-notification>
			</div>
		{/if}
		{@render children()}
	</main>
</div>

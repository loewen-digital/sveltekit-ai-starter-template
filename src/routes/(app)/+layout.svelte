<script lang="ts">
	import LogoutButton from '$lib/features/auth/components/LogoutButton.svelte';

	let { data, children } = $props();

	let menuOpen = $state(false);
</script>

<div class="min-h-screen bg-surface">
	<nav class="border-b border-border bg-surface">
		<div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
			<a href="/" class="text-lg font-bold text-text-primary">SvelteKit Starter</a>

			<!-- Desktop -->
			<div class="hidden items-center gap-4 sm:flex">
				<span class="text-sm text-text-secondary">{data.user.email}</span>
				<a href="/profile" class="text-sm text-text-secondary hover:text-primary">Settings</a>
				<LogoutButton />
			</div>

			<!-- Mobile toggle -->
			<button class="text-text-primary sm:hidden" onclick={() => (menuOpen = !menuOpen)}>
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
						<span class="text-sm text-text-secondary">{data.user.email}</span>
						<LogoutButton />
					</div>
					<a href="/profile" class="text-sm text-text-secondary hover:text-primary">Settings</a>
				</div>
			</div>
		{/if}
	</nav>

	<main class="mx-auto max-w-7xl px-4 py-8">
		{@render children()}
	</main>
</div>

<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		open = $bindable(false),
		title = '',
		children
	}: {
		open?: boolean;
		title?: string;
		children?: Snippet;
	} = $props();

	let dialogEl: HTMLDialogElement | undefined = $state();

	$effect(() => {
		if (!dialogEl) return;
		if (open) {
			dialogEl.showModal();
		} else {
			dialogEl.close();
		}
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			open = false;
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === dialogEl) {
			open = false;
		}
	}
</script>

<dialog
	bind:this={dialogEl}
	onkeydown={handleKeydown}
	onclick={handleBackdropClick}
	class="max-w-lg rounded-lg border border-border bg-surface p-0 shadow-lg backdrop:bg-black/50 backdrop:backdrop-blur-sm open:animate-in open:fade-in"
>
	<div class="p-6">
		{#if title}
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-lg font-semibold text-text-primary">{title}</h2>
				<button
					onclick={() => (open = false)}
					class="text-text-muted transition-colors hover:text-text-primary"
					aria-label="Close"
				>
					✕
				</button>
			</div>
		{/if}

		{#if children}
			{@render children()}
		{/if}
	</div>
</dialog>

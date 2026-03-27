<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		padding = true,
		header,
		footer,
		children
	}: {
		padding?: boolean;
		header?: Snippet;
		footer?: Snippet;
		children?: Snippet;
	} = $props();
</script>

<div class="rounded-lg border border-border bg-surface shadow-sm">
	{#if header}
		<div class="border-b border-border px-6 py-4">
			{@render header()}
		</div>
	{/if}

	<div class={padding ? 'p-6' : ''}>
		{#if children}
			{@render children()}
		{/if}
	</div>

	{#if footer}
		<div class="border-t border-border px-6 py-4">
			{@render footer()}
		</div>
	{/if}
</div>

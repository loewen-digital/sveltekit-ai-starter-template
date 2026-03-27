<script lang="ts">
	import Button from './Button.svelte';

	let {
		message = '',
		actionLabel = '',
		onAction
	}: {
		message?: string;
		actionLabel?: string;
		onAction?: () => void;
	} = $props();
</script>

<div class="flex flex-col items-center justify-center py-12 text-center">
	<p class="text-text-muted">{message}</p>

	{#if actionLabel && onAction}
		<div class="mt-4">
			<Button variant="primary" onclick={onAction}>
				{actionLabel}
			</Button>
		</div>
	{/if}
</div>

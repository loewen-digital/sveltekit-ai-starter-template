<script lang="ts">
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
	<p class="text-fg-muted">{message}</p>

	{#if actionLabel && onAction}
		<div class="mt-4">
			<!-- el-button is the interactive control (a native button in its shadow
			     root); Svelte only sees a custom tag with a click handler. -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<el-button variant="primary" onclick={onAction}>{actionLabel}</el-button>
		</div>
	{/if}
</div>

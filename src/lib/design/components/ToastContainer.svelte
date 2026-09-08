<script lang="ts">
	import { getToasts, dismissToast } from '$lib/features/toast/toast.svelte.js';

	let toasts = $derived(getToasts());

	// The store's "info" is the element's "primary"; the other variants match.
	const variant = (v: string) =>
		(v === 'info' ? 'primary' : v) as 'primary' | 'success' | 'warning' | 'danger';
</script>

{#if toasts.length > 0}
	<div class="fixed right-4 bottom-4 z-50 flex flex-col gap-2">
		{#each toasts as toast (toast.id)}
			<!-- Auto-dismiss stays with the store; the close button hides the element
			     and `notification-hide` hands that back to the store. -->
			<el-notification
				variant={variant(toast.variant)}
				open
				closable
				onnotification-hide={() => dismissToast(toast.id)}
			>
				{toast.message}
			</el-notification>
		{/each}
	</div>
{/if}

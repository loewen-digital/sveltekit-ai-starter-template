<script lang="ts">
	import { getToasts, dismissToast } from '$lib/features/toast/toast.svelte.js';
	import Toast from './Toast.svelte';

	let toasts = $derived(getToasts());
</script>

{#if toasts.length > 0}
	<div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
		{#each toasts as toast (toast.id)}
			<Toast message={toast.message} variant={toast.variant} onDismiss={() => dismissToast(toast.id)} />
		{/each}
	</div>
{/if}

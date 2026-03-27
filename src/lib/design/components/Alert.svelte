<script lang="ts">
	type Variant = 'info' | 'success' | 'warning' | 'danger';

	let {
		variant = 'info',
		dismissible = false,
		children
	}: {
		variant?: Variant;
		dismissible?: boolean;
		children?: import('svelte').Snippet;
	} = $props();

	let visible = $state(true);

	const variantClasses: Record<Variant, string> = {
		info: 'bg-primary/10 border-primary/30 text-primary',
		success: 'bg-success/10 border-success/30 text-success',
		warning: 'bg-warning/10 border-warning/30 text-warning',
		danger: 'bg-danger/10 border-danger/30 text-danger'
	};

	const icons: Record<Variant, string> = {
		info: 'ⓘ',
		success: '✓',
		warning: '⚠',
		danger: '✕'
	};
</script>

{#if visible}
	<div class="flex items-start gap-3 rounded-md border p-4 {variantClasses[variant]}" role="alert">
		<span class="text-lg leading-none" aria-hidden="true">{icons[variant]}</span>

		<div class="flex-1 text-sm">
			{#if children}
				{@render children()}
			{/if}
		</div>

		{#if dismissible}
			<button
				onclick={() => (visible = false)}
				class="text-current opacity-60 transition-opacity hover:opacity-100"
				aria-label="Dismiss"
			>
				✕
			</button>
		{/if}
	</div>
{/if}

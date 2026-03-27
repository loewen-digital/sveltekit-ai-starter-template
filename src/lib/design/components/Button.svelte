<script lang="ts">
	import type { Snippet } from 'svelte';
	import Spinner from './Spinner.svelte';

	type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
	type Size = 'sm' | 'md' | 'lg';

	let {
		variant = 'primary',
		size = 'md',
		disabled = false,
		loading = false,
		type = 'button',
		onclick,
		children
	}: {
		variant?: Variant;
		size?: Size;
		disabled?: boolean;
		loading?: boolean;
		type?: 'button' | 'submit' | 'reset';
		onclick?: (e: MouseEvent) => void;
		children?: Snippet;
	} = $props();

	const variantClasses: Record<Variant, string> = {
		primary: 'bg-primary text-primary-text hover:bg-primary-hover focus-visible:ring-primary/50',
		secondary:
			'bg-surface-secondary text-text-primary border border-border hover:bg-surface-hover focus-visible:ring-primary/50',
		danger: 'bg-danger text-white hover:bg-danger-hover focus-visible:ring-danger/50',
		ghost: 'text-text-primary hover:bg-surface-secondary focus-visible:ring-primary/50'
	};

	const sizeClasses: Record<Size, string> = {
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-4 py-2 text-sm',
		lg: 'px-6 py-3 text-base'
	};

	let isDisabled = $derived(disabled || loading);
</script>

<button
	{type}
	class="inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 {variantClasses[
		variant
	]} {sizeClasses[size]}"
	disabled={isDisabled}
	{onclick}
>
	{#if loading}
		<Spinner size="sm" />
	{/if}
	{#if children}
		{@render children()}
	{/if}
</button>

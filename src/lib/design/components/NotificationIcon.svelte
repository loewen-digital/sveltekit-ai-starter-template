<script lang="ts">
	/**
	 * UPSTREAM: https://github.com/webtides/element-library/issues/88
	 * el-notification's own variant icon is invisible when the element renders
	 * in the browser (its SVG children land in the HTML namespace). Slotting
	 * the same icons from Svelte, which creates them in the SVG namespace,
	 * keeps toasts and re-rendered alerts complete. Remove once fixed upstream.
	 */
	let { variant }: { variant: 'info' | 'success' | 'warning' | 'danger' } = $props();
</script>

<svg
	class="h-5 w-5"
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	{#if variant === 'success'}
		<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
		<polyline points="22 4 12 14.01 9 11.01" />
	{:else if variant === 'danger'}
		<circle cx="12" cy="12" r="10" />
		<line x1="12" y1="8" x2="12" y2="12" />
		<line x1="12" y1="16" x2="12.01" y2="16" />
	{:else if variant === 'warning'}
		<path
			d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
		/>
		<line x1="12" y1="9" x2="12" y2="13" />
		<line x1="12" y1="17" x2="12.01" y2="17" />
	{:else}
		<circle cx="12" cy="12" r="10" />
		<line x1="12" y1="16" x2="12" y2="12" />
		<line x1="12" y1="8" x2="12.01" y2="8" />
	{/if}
</svg>

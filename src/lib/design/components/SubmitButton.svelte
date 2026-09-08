<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * UPSTREAM: https://github.com/webtides/element-library/issues/86
	 * The only wrapper in the design system. `<el-button type="submit">` keeps
	 * its native button in the shadow root, where it is no submit button of
	 * the form: Enter never submits, a click before the element upgrades is
	 * lost, and nothing submits without scripting. This renders the element
	 * plus a native submit button in light DOM; theme.css hides that button
	 * while scripting is enabled and shows it instead of the element without,
	 * and app.html forwards pre-upgrade clicks. Delete once #86 ships and use
	 * `<el-button type="submit">` directly.
	 */
	let {
		variant = 'default',
		size = 'medium',
		loading = false,
		disabled = false,
		children
	}: {
		variant?: 'default' | 'primary' | 'success' | 'neutral' | 'warning' | 'danger' | 'text';
		size?: 'small' | 'medium' | 'large';
		loading?: boolean;
		disabled?: boolean;
		children?: Snippet;
	} = $props();
</script>

<el-button type="submit" {variant} {size} {loading} {disabled}>
	{@render children?.()}
</el-button>
<button type="submit" class="el-button-submit" {disabled}>{@render children?.()}</button>

<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'default' | 'primary' | 'success' | 'neutral' | 'warning' | 'danger' | 'text';
	type Size = 'small' | 'medium' | 'large';

	let {
		variant = 'default',
		size = 'medium',
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
		onclick?: (event: MouseEvent) => void;
		children?: Snippet;
	} = $props();
</script>

<!-- The element is the interactive control (a native <button> in its shadow root);
     Svelte only sees a custom tag with a click handler. -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<el-button {variant} {size} {type} {disabled} {loading} {onclick}>
	{@render children?.()}
</el-button>

{#if type === 'submit'}
	<!--
		UPSTREAM: https://github.com/webtides/element-library/issues/86
		el-button keeps its native <button> in the shadow root, where it is no
		submit button of the form: Enter never submits, and without scripting a
		click does nothing. This light-DOM button gives the form its submit
		button. theme.css hides it while scripting is enabled and swaps it in
		for the element without; app.html bridges clicks until the element has
		upgraded.
	-->
	<button type="submit" class="el-button-submit" {disabled}>{@render children?.()}</button>
{/if}

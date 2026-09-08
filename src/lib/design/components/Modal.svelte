<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		open = $bindable(false),
		title = '',
		children,
		footer
	}: {
		open?: boolean;
		title?: string;
		children?: Snippet;
		/** Rendered in the dialog's footer slot, typically the action buttons. */
		footer?: Snippet;
	} = $props();
</script>

<!--
	The element is built on the native <dialog>: focus trap, Escape, backdrop,
	scroll lock and labelling are its job. `dialog-hide` fires for every way it
	closes (close button, Escape, overlay click, `open` set to false), which
	keeps `open` in sync for bind:open.
-->
<el-dialog {open} label={title} ondialog-hide={() => (open = false)}>
	{@render children?.()}
	{#if footer}
		<div slot="footer" class="flex justify-end gap-2">{@render footer()}</div>
	{/if}
</el-dialog>

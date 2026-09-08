<script lang="ts">
	import type { Snippet } from 'svelte';
	import NotificationIcon from './NotificationIcon.svelte';

	type Variant = 'info' | 'success' | 'warning' | 'danger';

	let {
		variant = 'info',
		dismissible = false,
		children
	}: {
		variant?: Variant;
		dismissible?: boolean;
		children?: Snippet;
	} = $props();

	// element-library calls the informational variant "primary"; the rest match.
	const elementVariant = $derived(variant === 'info' ? 'primary' : variant);
	// The element sets these itself once it upgrades; setting them server-side
	// makes the message a live region before that, and without JavaScript.
	const role = $derived(variant === 'danger' || variant === 'warning' ? 'alert' : 'status');
</script>

<el-notification variant={elementVariant} open closable={dismissible} {role}>
	<span slot="icon" class="inline-flex"><NotificationIcon {variant} /></span>
	{@render children?.()}
</el-notification>

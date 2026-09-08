<script lang="ts">
	import NotificationIcon from './NotificationIcon.svelte';

	type Variant = 'info' | 'success' | 'warning' | 'danger';

	let {
		message,
		variant = 'info',
		onDismiss
	}: {
		message: string;
		variant?: Variant;
		onDismiss: () => void;
	} = $props();

	// element-library calls the informational variant "primary"; the rest match.
	const elementVariant = $derived(variant === 'info' ? 'primary' : variant);
</script>

<!-- Auto-dismiss stays with the toast store; the close button hides the element,
     and `notification-hide` hands that back to the store. -->
<el-notification variant={elementVariant} open closable onnotification-hide={onDismiss}>
	<span slot="icon" class="inline-flex"><NotificationIcon {variant} /></span>
	{message}
</el-notification>

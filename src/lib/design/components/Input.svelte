<script lang="ts">
	type InputType = 'text' | 'email' | 'password' | 'number';

	let {
		type = 'text',
		label = '',
		error = '',
		placeholder = '',
		required = false,
		disabled = false,
		name,
		value = $bindable('')
	}: {
		type?: InputType;
		label?: string;
		error?: string;
		placeholder?: string;
		required?: boolean;
		disabled?: boolean;
		/** Also names the native input and links the label to it. */
		name: string;
		value?: string;
	} = $props();

	let host: HTMLElement | undefined = $state();

	// The element renders its native <input> in light DOM and tracks `value`
	// itself, so the wrapper only has to bridge Svelte's binding: read every
	// keystroke from the native input, and write programmatic changes (a reset
	// after a successful submit) straight into it, because the element only
	// re-renders the `value` attribute, which a dirty input ignores.
	function oninput(event: Event) {
		const input = event.target;
		if (input instanceof HTMLInputElement) value = input.value;
	}

	// On the first run the native input wins: whatever was typed or autofilled
	// before hydration must not be wiped by the empty initial state (that is
	// what Svelte's own bind:value does on hydration, too).
	let adopted = false;
	$effect(() => {
		const input = host?.querySelector('input');
		if (!input) return;
		if (!adopted) {
			adopted = true;
			if (input.value !== value) {
				value = input.value;
				return;
			}
		}
		if (input.value !== value) input.value = value;
	});
</script>

{#if type === 'password'}
	<el-password-field
		bind:this={host}
		{name}
		{label}
		{placeholder}
		{required}
		{disabled}
		{value}
		error-message={error || undefined}
		valid={error ? false : undefined}
		{oninput}
	></el-password-field>
{:else}
	<el-input-field
		bind:this={host}
		{type}
		{name}
		{label}
		{placeholder}
		{required}
		{disabled}
		{value}
		error-message={error || undefined}
		valid={error ? false : undefined}
		{oninput}
	></el-input-field>
{/if}

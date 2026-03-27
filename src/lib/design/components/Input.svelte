<script lang="ts">
	type InputType = 'text' | 'email' | 'password' | 'number';

	let {
		type = 'text',
		label = '',
		error = '',
		placeholder = '',
		required = false,
		disabled = false,
		name = '',
		value = $bindable('')
	}: {
		type?: InputType;
		label?: string;
		error?: string;
		placeholder?: string;
		required?: boolean;
		disabled?: boolean;
		name?: string;
		value?: string;
	} = $props();

	let inputId = $derived(name || label.toLowerCase().replace(/\s+/g, '-'));
</script>

<div class="flex flex-col gap-1.5">
	{#if label}
		<label for={inputId} class="text-sm font-medium text-text-primary">
			{label}
			{#if required}
				<span class="text-danger" aria-hidden="true">*</span>
			{/if}
		</label>
	{/if}

	<input
		id={inputId}
		{type}
		{name}
		{placeholder}
		{required}
		{disabled}
		bind:value
		class="rounded-md border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50
			{error
			? 'border-danger text-text-primary focus:ring-danger/50'
			: 'border-border text-text-primary focus:ring-primary/50'}
			bg-surface"
	/>

	{#if error}
		<p class="text-sm text-danger">{error}</p>
	{/if}
</div>

<script lang="ts">
	import { enhance } from '$app/forms';
	import { SubmitButton } from '#lib/design/components/index.js';
</script>

<form method="POST" action="/logout" use:enhance>
	<SubmitButton variant="text" size="small">Logout</SubmitButton>
</form>

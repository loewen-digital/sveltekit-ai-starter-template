<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/design/components';
</script>

<form method="POST" action="/logout" use:enhance>
	<Button type="submit" variant="ghost" size="sm">Logout</Button>
</form>

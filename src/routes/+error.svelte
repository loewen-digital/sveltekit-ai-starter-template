<script lang="ts">
	import { page } from '$app/stores';
	import { Alert, Button } from '$lib/design/components';
</script>

<div class="flex min-h-screen items-center justify-center px-4">
	<div class="text-center">
		<h1 class="text-6xl font-bold text-text-primary">{$page.status}</h1>
		<div class="mt-4">
			<Alert variant="danger">{$page.error?.message ?? 'Something went wrong'}</Alert>
		</div>
		<div class="mt-6">
			<Button variant="primary" onclick={() => (window.location.href = '/')}>Go Home</Button>
		</div>
	</div>
</div>

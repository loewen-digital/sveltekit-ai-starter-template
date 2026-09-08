<script lang="ts">
	import { page } from '$app/stores';
</script>

<main class="flex min-h-screen items-center justify-center px-4">
	<div class="text-center">
		<h1 class="text-6xl font-bold text-text-primary">{$page.status}</h1>
		<div class="mt-4">
			<el-notification variant="danger" open role="alert">
				{$page.error?.message ?? 'Something went wrong'}
			</el-notification>
		</div>
		<div class="mt-6">
			<el-button variant="primary" href="/">Go Home</el-button>
		</div>
	</div>
</main>

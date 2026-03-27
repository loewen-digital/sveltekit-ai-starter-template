<script lang="ts">
	import '../app.css';
	import { ToastContainer } from '$lib/design/components';

	let { children } = $props();
</script>

{@render children()}
<ToastContainer />

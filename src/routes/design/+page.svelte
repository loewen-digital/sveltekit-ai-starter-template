<!--
	Proof page for the element-library SSR/hydration wiring (issue #6). Goes
	away once the first real page uses an element (issue #7).
-->
<svelte:head>
	<title>Design system</title>
</svelte:head>

<main class="mx-auto max-w-lg px-4 py-8">
	<h1 class="text-2xl font-bold text-text-primary">Element library</h1>
	<p class="mt-2 text-text-secondary">
		Server-rendered as Declarative Shadow DOM, hydrated on the client.
	</p>
	<div class="mt-6 flex flex-wrap gap-3">
		<el-button variant="primary">Primary</el-button>
		<el-button variant="default">Default</el-button>
		<el-button variant="danger" outline="true">Danger</el-button>
		<el-button loading="true">Loading</el-button>
	</div>
</main>

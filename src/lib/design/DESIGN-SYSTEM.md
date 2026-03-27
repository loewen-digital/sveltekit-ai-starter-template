# Design System

## Rules

1. **Always use design components** from `$lib/design/components/` — never build custom Buttons, Inputs, Cards, etc.
2. **Always use semantic colors** — `bg-primary`, `text-danger`, `border-success` — never raw colors like `bg-blue-600`.
3. **Tailwind spacing conventions** — use the default scale: `p-4`, `gap-6`, `mt-8`. Avoid arbitrary values.
4. **Every view must handle these states**: Loading (Spinner), Error (Alert), Empty (EmptyState).

## Components

### Button

```svelte
<script lang="ts">
	import { Button } from '$lib/design/components';
</script>

<Button variant="primary" size="md" onclick={() => save()}>Save</Button>
<Button variant="danger" loading={true}>Deleting...</Button>
<Button variant="secondary" disabled={true}>Disabled</Button>
<Button variant="ghost" size="sm">Cancel</Button>
```

Props: `variant` (primary | secondary | danger | ghost), `size` (sm | md | lg), `disabled`, `loading`, `type`, `onclick`

### Input

```svelte
<script lang="ts">
	import { Input } from '$lib/design/components';
	let email = $state('');
</script>

<Input type="email" label="Email" bind:value={email} required />
<Input type="password" label="Password" error="Too short" />
```

Props: `type` (text | email | password | number), `label`, `error`, `placeholder`, `required`, `disabled`, `name`, `value` ($bindable)

### Card

```svelte
<script lang="ts">
	import { Card } from '$lib/design/components';
</script>

<Card>
	<p>Simple card content</p>
</Card>

<Card>
	{#snippet header()}<h3>Title</h3>{/snippet}
	<p>Body content</p>
	{#snippet footer()}<Button>Action</Button>{/snippet}
</Card>
```

Props: `padding` (boolean, default true), `header` (snippet), `footer` (snippet)

### Alert

```svelte
<script lang="ts">
	import { Alert } from '$lib/design/components';
</script>

<Alert variant="success" dismissible>Changes saved!</Alert>
<Alert variant="danger">Something went wrong.</Alert>
<Alert variant="warning">Unsaved changes.</Alert>
<Alert variant="info">Tip: You can do this.</Alert>
```

Props: `variant` (info | success | warning | danger), `dismissible`

### Modal

```svelte
<script lang="ts">
	import { Modal, Button } from '$lib/design/components';
	let open = $state(false);
</script>

<Button onclick={() => (open = true)}>Open</Button>

<Modal bind:open title="Confirm">
	<p>Are you sure?</p>
</Modal>
```

Props: `open` ($bindable), `title`

### Spinner

```svelte
<script lang="ts">
	import { Spinner } from '$lib/design/components';
</script>

<Spinner size="sm" />
<Spinner size="md" />
<Spinner size="lg" />
```

Props: `size` (sm | md | lg)

### EmptyState

```svelte
<script lang="ts">
	import { EmptyState } from '$lib/design/components';
</script>

<EmptyState message="No items yet." actionLabel="Create" onAction={() => create()} />
```

Props: `message`, `actionLabel`, `onAction`

## Semantic Colors

| Token            | Light     | Dark      | Usage               |
| ---------------- | --------- | --------- | ------------------- |
| `primary`        | `#2563eb` | `#3b82f6` | Primary actions     |
| `primary-hover`  | `#1d4ed8` | `#2563eb` | Primary hover       |
| `primary-text`   | `#ffffff` | `#ffffff` | Text on primary     |
| `danger`         | `#dc2626` | `#ef4444` | Destructive actions |
| `success`        | `#16a34a` | `#22c55e` | Success states      |
| `warning`        | `#d97706` | `#f59e0b` | Warning states      |
| `text-primary`   | `#111827` | `#f9fafb` | Main text           |
| `text-secondary` | `#6b7280` | `#d1d5db` | Secondary text      |
| `text-muted`     | `#9ca3af` | `#6b7280` | Muted/placeholder   |
| `surface`        | `#ffffff` | `#111827` | Background          |
| `border`         | `#e5e7eb` | `#374151` | Borders             |

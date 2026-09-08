# Design System

The UI vocabulary is [`@webtides/element-library`](https://github.com/webtides/element-library): Web Components built with element-js, shared with every other loewen-digital project. They are server-rendered as Declarative Shadow DOM by [`@webtides/element-js-ssr-renderer`](https://github.com/webtides/element-js-ssr-renderer) and hydrate on the client, so pages are complete before JavaScript runs.

## Rules

1. **Use the wrappers in `$lib/design/components/`** where one exists (`Button`, `Input`, `Alert`, `Toast`, `Modal`). They exist only to bridge SvelteKit ergonomics: `bind:value`, form actions, `onclick`, `bind:open`.
2. **Any other element-library component is used directly** as `<el-…>` in a Svelte template. Add its attributes to `src/lib/design/elements.d.ts` so svelte-check checks them.
3. **Never build your own buttons, inputs, dialogs or notifications.** A component missing in element-library is filed as an issue in webtides/element-library; a local workaround is marked `// UPSTREAM: <issue-url>` and removed once the fix ships.
4. **Semantic colours only** — `bg-primary`, `text-danger`, `border-success` — never `bg-blue-600`. They alias the `--el-*` tokens (see Theme).
5. **Tailwind for layout and utilities**, the default spacing scale (`p-4`, `gap-6`, `mt-8`), no arbitrary values.
6. **Every view handles these states**: loading (`Spinner`), error (`Alert`), empty (`EmptyState`).

## How it is wired

| File                           | Role                                                                                                                                                                |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/design/catalog.ts`    | One tag → module map (element-library's own `catalog`), with per-component SSR settings. Server and client read the same map.                                       |
| `src/hooks.server.ts`          | `init` loads the renderer's DOM shim and then `elementSSR`; the `handle` pre-renders every `el-*` tag on a page. Only the components on that page are loaded.       |
| `src/lib/design/autoload.ts`   | Called from the root layout's module scope: discovers the tags on the page, loads and defines them, and watches for elements added by client-side navigation.       |
| `src/app.css`                  | Imports `@webtides/element-library/themes/default.css`, then `src/lib/design/theme.css`, and maps Tailwind's semantic colours onto the tokens with `@theme inline`. |
| `src/lib/design/theme.css`     | The project's token overrides, plus the styles behind the `UPSTREAM` workarounds.                                                                                   |
| `src/lib/design/vendor.d.ts`   | Type shims for subpath exports that ship without declarations.                                                                                                      |
| `src/lib/design/elements.d.ts` | Attribute typing for the `el-*` tags used in templates.                                                                                                             |

Shadow components style themselves through the `--el-*` custom properties, which inherit into shadow roots; the document stylesheet is deliberately not copied into them (`adoptGlobalStyles: false`). Slotted content is light DOM and takes Tailwind classes as usual. Form fields render their native `<input>` in light DOM, so forms post without JavaScript and E2E selectors like `input[name="email"]` keep working.

Boolean attributes are written as booleans in Svelte (`disabled={disabled}`); element-js parses the resulting `"true"`/`"false"` strings.

## Components

### Button

```svelte
<script lang="ts">
	import { Button } from '$lib/design/components';
</script>

<Button variant="primary" onclick={() => save()}>Save</Button>
<Button variant="danger" loading={true}>Deleting...</Button>
<Button variant="default" disabled={true}>Disabled</Button>
<Button variant="text" size="small">Cancel</Button>
<Button type="submit" variant="primary">Login</Button>
```

Props: `variant` (default | primary | success | neutral | warning | danger | text), `size` (small | medium | large), `disabled`, `loading`, `type` (button | submit | reset), `onclick`. Wraps `el-button`.

`type="submit"` also renders a hidden native submit button in light DOM, so Enter submits the form and it submits before hydration and without JavaScript (`UPSTREAM` webtides/element-library#86; the styles live in `theme.css`, the pre-upgrade click bridge in `app.html`).

### Input

```svelte
<script lang="ts">
	import { Input } from '$lib/design/components';
	let email = $state('');
</script>

<Input type="email" name="email" label="Email" bind:value={email} required />
<Input type="password" name="password" label="Password" error="Too short" />
```

Props: `type` (text | email | password | number), `name` (required; names the input and links the label), `label`, `error`, `placeholder`, `required`, `disabled`, `value` ($bindable). Wraps `el-input-field`, or `el-password-field` for passwords (adds a show/hide toggle). Text typed or autofilled before hydration is kept.

### Alert

```svelte
<Alert variant="success" dismissible>Changes saved!</Alert>
<Alert variant="danger">Something went wrong.</Alert>
```

Props: `variant` (info | success | warning | danger; `info` is the element's `primary`), `dismissible`. Wraps `el-notification` as an inline live region (`role="alert"` for danger and warning, `role="status"` otherwise). Server-rendered alerts are visible before the element upgrades and without JavaScript (`UPSTREAM` webtides/element-library#87, style injected from `catalog.ts`); the icon is slotted from `NotificationIcon.svelte` (`UPSTREAM` webtides/element-library#88).

Render the server's message from the form action (`form.error`, `form.success`) so it also shows after a native submit; see `docs/decisions/0003-profile-feedback-inline-not-toast.md`.

### Toast

```ts
import { addToast } from '$lib/features/toast/toast.svelte.js';

addToast({ message: 'Saved', variant: 'success', duration: 5000 });
```

`ToastContainer` (mounted in the root layout) renders the store's toasts as `el-notification` in a fixed stack. Toasts are client-only feedback; anything the user must see after a native submit belongs in an `Alert`.

### Modal

```svelte
<script lang="ts">
	import { Modal, Button } from '$lib/design/components';
	let open = $state(false);
</script>

<Button onclick={() => (open = true)}>Open</Button>

<Modal bind:open title="Confirm">
	<p>Are you sure?</p>
	{#snippet footer()}
		<Button onclick={() => (open = false)}>Cancel</Button>
		<Button variant="danger" onclick={() => (open = false)}>Delete</Button>
	{/snippet}
</Modal>
```

Props: `open` ($bindable), `title`, `footer` (snippet). Wraps `el-dialog`; focus trap, Escape, backdrop click, scroll lock and labelling come from the native `<dialog>` inside it.

### Card, Spinner, EmptyState

Svelte components, unchanged; element-library has no counterpart yet (webtides/element-library#81, #82, #83). Same APIs as before: `Card` (`padding`, `header` and `footer` snippets), `Spinner` (`size` sm | md | lg), `EmptyState` (`message`, `actionLabel`, `onAction`).

## Theme

`themes/default.css` defines the whole `--el-*` contract with `light-dark()` and opts the document into `color-scheme: light dark`; `theme.css` overrides the values below, and `app.css` maps Tailwind's names onto them. Add a token in `theme.css`, alias it in `app.css` if utilities need it.

| Token                 | Tailwind            | Light     | Dark      |
| --------------------- | ------------------- | --------- | --------- |
| `--el-color-accent`   | `primary`           | `#2563eb` | `#3b82f6` |
| `--el-color-danger`   | `danger`            | `#dc2626` | `#ef4444` |
| `--el-color-success`  | `success`           | `#16a34a` | `#22c55e` |
| `--el-color-warning`  | `warning`           | `#d97706` | `#f59e0b` |
| `--el-color-fg`       | `text-primary`      | `#111827` | `#f9fafb` |
| `--el-color-fg-muted` | `text-secondary`    | `#6b7280` | `#d1d5db` |
| `--el-color-bg`       | `surface`           | `#ffffff` | `#111827` |
| `--el-color-bg-muted` | `surface-secondary` | `#f3f4f6` | `#1f2937` |
| `--el-color-border`   | `border`            | `#e5e7eb` | `#374151` |

Project-only utilities without an element token (`primary-hover`, `primary-text`, `danger-hover`, `success-hover`, `warning-hover`, `text-muted`, `surface-hover`) are defined in `app.css`.

## Testing

- Playwright locators pierce shadow DOM: `getByRole('button', { name: 'Login' })` finds the native button inside `el-button`.
- Wait for upgrade before asserting on client behaviour: `el.matches(':defined')`.
- `tests/e2e/elements.spec.ts` covers SSR markup and hydration, `progressive-enhancement.spec.ts` the no-JS path and Enter to submit, `a11y.spec.ts` runs axe on login and register.

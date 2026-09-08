# Design System

The UI vocabulary is [`@webtides/element-library`](https://github.com/webtides/element-library): Web Components built with element-js, shared with every other loewen-digital project. Pages use them directly as `<el-…>` tags. They are server-rendered as Declarative Shadow DOM by [`@webtides/element-js-ssr-renderer`](https://github.com/webtides/element-js-ssr-renderer) and hydrate on the client, so pages are complete before JavaScript runs.

## Rules

1. **Use the elements directly**: `<el-button>`, `<el-input-field>`, `<el-password-field>`, `<el-notification>`, `<el-dialog>`, and everything else in the library. No Svelte wrappers around them; the one exception is `SubmitButton` (see below).
2. **Type every tag you use** in `src/lib/design/elements.d.ts`, so svelte-check catches a wrong variant or attribute. Attributes are the library's: `variant`, `size`, `label`, `error-message`, … Booleans are written as booleans (`disabled={loading}`); element-js parses the resulting `"true"`/`"false"`.
3. **Never build your own buttons, inputs, dialogs or notifications.** A component missing in element-library is filed as an issue in webtides/element-library; a local workaround is marked `// UPSTREAM: <issue-url>` and removed once the fix ships.
4. **Token colours only** — `bg-accent`, `text-fg`, `text-danger`, `border-border` — never `bg-blue-600`. Tailwind's names are the `--el-*` token names (see Theme).
5. **Tailwind for layout and utilities**, the default spacing scale (`p-4`, `gap-6`, `mt-8`), no arbitrary values.
6. **Every view handles these states**: loading (`Spinner`), error (`el-notification`), empty (`EmptyState`).

## How it is wired

| File                           | Role                                                                                                                                                                                       |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/lib/design/catalog.ts`    | One tag → module map (element-library's own `catalog`) with per-component SSR settings, plus the `properties` provider that seeds empty field values. Server and client read the same map. |
| `src/hooks.server.ts`          | `init` loads the renderer's DOM shim and then `elementSSR`; the `handle` pre-renders every `el-*` tag on a page. Only the components on that page are loaded.                              |
| `src/routes/+layout.svelte`    | Its module script calls the renderer's `autoload` with the catalog: discovers the tags on the page, loads and defines them, and watches for elements added by client-side navigation.      |
| `src/app.css`                  | Imports `@webtides/element-library/themes/default.css`, then `src/lib/design/theme.css`, and exposes the tokens as Tailwind colours under the same names with `@theme inline`.             |
| `src/lib/design/theme.css`     | The project's token overrides, plus the styles behind the `UPSTREAM` workarounds.                                                                                                          |
| `src/lib/design/vendor.d.ts`   | Type shims for subpath exports that ship without declarations.                                                                                                                             |
| `src/lib/design/elements.d.ts` | Attribute typing for the `el-*` tags used in templates (`UPSTREAM` webtides/element-library#89; extend it for every new tag).                                                              |
| `src/lib/design/components/`   | `SubmitButton` (the one wrapper), and the Svelte-only `Card`, `Spinner`, `EmptyState`.                                                                                                     |

Shadow components style themselves through the `--el-*` custom properties, which inherit into shadow roots; the document stylesheet is deliberately not copied into them (`adoptGlobalStyles: false`). Slotted content is light DOM and takes Tailwind classes as usual.

## Forms

Form fields (`el-input-field`, `el-password-field`, …) render their native `<input>` in light DOM: SvelteKit form actions post them without JavaScript, `use:enhance` sees them in `formData`, and E2E selectors like `input[name="email"]` keep working. There is no `bind:value`; client-side validation reads `formData` in the `use:enhance` callback, and `update()`'s native form reset clears the fields after a successful submit.

```svelte
<script lang="ts">
	import { enhance } from '$app/forms';
	import { SubmitButton } from '$lib/design/components';
	import { validateEmail } from '$lib/shared/validation.js';

	let { form } = $props();
	let clientError = $state('');
	let loading = $state(false);
	let error = $derived(clientError || form?.error || '');
</script>

{#if error}
	<el-notification variant="danger" open role="alert">{error}</el-notification>
{/if}

<form
	method="POST"
	use:enhance={({ formData, cancel }) => {
		const err = validateEmail(String(formData.get('email') ?? '')) ?? '';
		if (err) {
			clientError = err;
			cancel();
			return;
		}
		loading = true;
		return async ({ update }) => {
			loading = false;
			await update();
		};
	}}
	class="flex flex-col gap-4"
>
	<el-input-field type="email" name="email" label="Email" required></el-input-field>
	<el-password-field name="password" label="Password" required></el-password-field>
	<SubmitButton variant="primary" {loading}>Login</SubmitButton>
</form>
```

`name` is required on every field: it names the input and links the label to it.

### SubmitButton

The only wrapper. `<el-button type="submit">` keeps its native button in the shadow root, where it is no submit button of the form: Enter never submits, a click before the element upgrades is lost, and nothing submits without JavaScript (`UPSTREAM` webtides/element-library#86). `SubmitButton` renders the element plus a hidden native submit button in light DOM (`theme.css` shows that button instead of the element under `@media (scripting: none)`; `app.html` forwards pre-upgrade clicks). Props: `variant`, `size`, `loading`, `disabled`. Once #86 ships, delete it and write `<el-button type="submit">`.

## Notifications

```svelte
<el-notification variant="danger" open role="alert">Invalid email or password</el-notification>
<el-notification variant="success" open role="status">Saved.</el-notification>
<el-notification variant="warning" open closable role="alert">Unsaved changes.</el-notification>
```

Variants: `default`, `primary` (informational), `success`, `neutral`, `warning`, `danger`. Set `role` yourself (`alert` for danger and warning, `status` otherwise): the element does it on upgrade, the server-rendered markup needs it before that and without JavaScript. Render the server's message from the form action (`form.error`, `form.success`) so it also shows after a native submit; see `docs/decisions/0003-profile-feedback-inline-not-toast.md`.

Toasts are the element's own job: create an `el-notification`, set `variant`, `closable` and `duration`, and call `toast()`; it moves itself into a shared top-right stack, pauses the countdown while hovered or focused, and removes itself afterwards.

```ts
const note = document.createElement('el-notification');
note.variant = 'success';
note.closable = true;
note.duration = 5000;
note.textContent = 'Saved.';
note.toast();
```

Toasts are client-only feedback; anything the user must see after a native submit belongs inline.

## Buttons and dialogs

```svelte
<el-button variant="primary" href="/">Go Home</el-button>
<el-button variant="text" size="small" loading={busy} onclick={save}>Save</el-button>

<el-dialog {open} label="Confirm" ondialog-hide={() => (open = false)}>
	<p>Are you sure?</p>
	<div slot="footer" class="flex justify-end gap-2">
		<el-button onclick={() => (open = false)}>Cancel</el-button>
		<el-button variant="danger" onclick={remove}>Delete</el-button>
	</div>
</el-dialog>
```

`el-button`: `variant` default | primary | success | neutral | warning | danger | text, `size` small | medium | large, `loading`, `disabled`, `href` (link mode). Svelte's a11y checks treat a custom element with `onclick` as a static element; put these two lines above an `el-button` with a click handler, the element is the interactive control:

```svelte
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
```

`el-dialog`: `open`, `label`, slots `footer`, `label`, `header-actions`; `dialog-hide` fires for every way it closes, which keeps a bound `open` in sync. Focus trap, Escape, backdrop and scroll lock come from the native `<dialog>` inside.

## Card, Spinner, EmptyState

Svelte components; element-library has no counterpart yet (webtides/element-library#81, #82, #83). `Card` (`padding`, `header` and `footer` snippets), `Spinner` (`size` sm | md | lg), `EmptyState` (`message`, `actionLabel`, `onAction`).

## Theme

`themes/default.css` defines the whole `--el-*` contract with `light-dark()` and opts the document into `color-scheme: light dark`; `theme.css` overrides the values below, and `app.css` exposes each token as a Tailwind colour under the same name, so `--el-color-accent` is `bg-accent` and `--el-color-fg-muted` is `text-fg-muted`. Add a token in `theme.css`, alias it in `app.css` if utilities need it.

| Token                 | Tailwind   | Light     | Dark      |
| --------------------- | ---------- | --------- | --------- |
| `--el-color-accent`   | `accent`   | `#2563eb` | `#3b82f6` |
| `--el-color-danger`   | `danger`   | `#dc2626` | `#ef4444` |
| `--el-color-success`  | `success`  | `#16a34a` | `#22c55e` |
| `--el-color-warning`  | `warning`  | `#d97706` | `#f59e0b` |
| `--el-color-fg`       | `fg`       | `#111827` | `#f9fafb` |
| `--el-color-fg-muted` | `fg-muted` | `#6b7280` | `#d1d5db` |
| `--el-color-bg`       | `bg`       | `#ffffff` | `#111827` |
| `--el-color-bg-muted` | `bg-muted` | `#f3f4f6` | `#1f2937` |
| `--el-color-border`   | `border`   | `#e5e7eb` | `#374151` |

## Upstream workarounds

All marked `UPSTREAM` in the code; each goes when its issue closes.

| Issue                                    | Workaround                                                                                              |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| webtides/element-library#86              | `SubmitButton`, `.el-button-submit` in `theme.css`, click bridge in `app.html`                          |
| webtides/element-library#87              | `catalog.ts` injects a rule that keeps a server-rendered `el-notification` visible until it connects    |
| webtides/element-library#88              | none; a client-rendered `el-notification` shows no icon until fixed                                     |
| webtides/element-js#167                  | `catalog.ts` seeds `value: ''` for fields without a `value` attribute (else the server writes `"null"`) |
| webtides/element-library#85, renderer#13 | `vendor.d.ts` type shims                                                                                |
| webtides/element-library#89              | `elements.d.ts`, hand-written attribute typings for the tags in use                                     |

## Testing

- Playwright locators pierce shadow DOM: `getByRole('button', { name: 'Login' })` finds the native button inside `el-button`. `getByLabel('Password', { exact: true })` avoids the password field's "Show password" toggle.
- Wait for upgrade before asserting on client behaviour: `el.matches(':defined')`.
- `tests/e2e/elements.spec.ts` covers SSR markup and hydration, `progressive-enhancement.spec.ts` the no-JS path and Enter to submit, `a11y.spec.ts` runs axe on login and register.

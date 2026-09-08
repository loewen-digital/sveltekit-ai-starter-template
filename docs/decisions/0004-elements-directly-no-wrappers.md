# 0004 · Elements are used directly; SubmitButton is the only wrapper (supersedes 0002)

## Context

Decision 0002 kept `Button`, and the following commits added `Input`, `Modal`, `Alert` and `Toast`, all thin Svelte wrappers around element-library tags. That contradicts #4 and #7: apps should share the library's vocabulary, and wrappers only exist where SvelteKit needs one. Behind a wrapper nobody ever writes `<el-button>`, and the rules even said "always use the wrappers". Of the five, only `Button`'s submit fallback (webtides/element-library#86) had a reason that is not sugar; `Input`'s `bind:value` was only needed because validation read Svelte state instead of `formData`.

## Decision

Pages and features use `<el-button>`, `<el-input-field>`, `<el-password-field>`, `<el-notification>` and `<el-dialog>` directly, typed in `src/lib/design/elements.d.ts`. Client-side validation reads `formData` in `use:enhance`; `update()`'s native reset clears fields. `SubmitButton.svelte` remains as the single wrapper, marked `UPSTREAM`, and is deleted when #86 ships. `Card`, `Spinner`, `EmptyState` stay Svelte until element-library has them (#81, #82, #83).

## Consequences

- Templates read like every other element-library project; svelte-check still checks variants and attributes.
- A client-rendered `el-notification` has no icon until webtides/element-library#88 is fixed; no local icon copy.
- Fields without a `value` attribute would render `value="null"` on the server (webtides/element-js#167); `catalog.ts` seeds an empty string until that is fixed.

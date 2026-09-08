# 0005 · Tailwind colour utilities carry the element-library token names

## Context

`app.css` exposed the `--el-*` tokens under the template's old names: `bg-primary` for `--el-color-accent`, `text-text-primary` for `--el-color-fg`, `bg-surface` for `--el-color-bg`, plus seven project-only tokens (`primary-hover`, `surface-hover`, …) that nothing used once the wrapper components were gone. Two vocabularies for one palette, in every project built from this template. Options: keep the aliases (no churn) or rename once, now, before more projects derive from the template.

## Decision

Tailwind colour names are the token names: `accent`, `danger`, `success`, `warning`, `fg`, `fg-muted`, `bg`, `bg-muted`, `border` (`bg-accent`, `text-fg-muted`, `bg-bg`, …). The unused project-only tokens are gone; the third text shade (`text-muted`) collapsed into `fg-muted`. The toast store, its container and test are removed as well: `el-notification` has `toast()`, and nothing in the template called `addToast` any more.

## Consequences

- One vocabulary from CSS token to utility class to element attribute; `DESIGN-SYSTEM.md` has the table.
- Classes in existing pages were renamed once (`text-text-primary` → `text-fg`, `text-primary` → `text-accent`, `bg-surface` → `bg-bg`).
- Toasts are created through the element API; see `DESIGN-SYSTEM.md`.

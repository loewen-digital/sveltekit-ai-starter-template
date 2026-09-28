# 0007 · Vite+ is the toolchain, no template linting in `.svelte` files

## Context

Vite+ 1.0 (MIT, 2026-09) bundles Vite 8, Vitest 5, Oxlint, Oxfmt and tsdown behind one CLI (`vp`) and one config file. Eddy decided on 2026-09-28 to move every loop repo to Vite+ and drop ESLint and Prettier (loewen-digital/agent-loop, T-016). Oxlint lints only the `<script>` of `.svelte` files. `vp migrate` keeps `eslint-plugin-svelte` as an Oxlint JS plugin, but its template rules never fire there: `{@html}` and `{@debug}` pass unflagged.

## Decision

`vite-plus` replaces `vite`, `vitest`, ESLint, Prettier and their plugins. `npm run check` runs `svelte-kit sync`, `vp check` (Oxfmt, Oxlint with type-aware checks, tsgo type check of `.ts`) and svelte-check (types and compiler warnings in `.svelte`). `eslint-plugin-svelte` and `globals` are removed; the gap in template linting is accepted. Playwright stays for E2E. The npm scripts stay the interface for the loop and CI.

## Consequences

- One config file for build, tests, lint and format; `vp check` finishes in about a second.
- Svelte-specific lint rules (`no-at-html-tags`, `no-at-debug-tags`, …) are gone; svelte-check still reports Svelte's compiler and accessibility warnings.
- `vite` in `package.json` is an npm alias of `@voidzero-dev/vite-plus-core` with a matching `overrides` entry, as `vp migrate` sets it up for npm.

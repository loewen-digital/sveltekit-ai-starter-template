# sveltekit-starter

## Stack

- SvelteKit v2, Svelte 5 (Runes: $state, $derived, $effect, $props, $bindable)
- TypeScript strict mode
- Tailwind CSS v4
- Lucia Auth v3 + Drizzle Adapter
- Drizzle ORM + SQLite (lokal) / D1 (Cloudflare)
- Vitest (Unit) + Playwright (E2E)
- Cloudflare Pages Adapter
- Node 22, npm

## Commands

- `npm run dev` — Dev Server
- `npm run build` — Production Build (Cloudflare)
- `npm run check` — svelte-check + TypeScript
- `npm run lint` — ESLint + Prettier
- `npm test` — Vitest Unit Tests
- `npm run test:e2e` — Playwright E2E Tests
- `npm run db:generate` — Drizzle Migration generieren
- `npm run db:migrate` — Drizzle Migration ausführen
- `npm run db:studio` — Drizzle Studio

## Architecture

- Feature-basiert: src/lib/features/[name]/
- Design System: src/lib/design/components/
- Server Code: src/lib/server/ (DB, shared server utils)
- Feature Server Code: src/lib/features/[name]/server/
- Route Groups: (auth) für Login/Register, (app) für geschützte Seiten
- Shared Types: src/lib/shared/types/

## Svelte 5 — Hard Rules

- IMMER Runes: $state, $derived, $effect
- NIEMALS Svelte 4 Stores (writable, readable, derived aus svelte/store)
- Event Handler: onclick, NICHT on:click
- Props: let { prop1, prop2 } = $props(), NICHT export let
- Bindable Props: $bindable() für Two-Way Binding
- Children: {#snippet children}{/snippet} oder {@render children()}, NICHT <slot>
- Für aktuelle Svelte 5 API: lies svelte.dev/llms.txt

## Design System — Hard Rules

- IMMER Komponenten aus $lib/design/components/ nutzen
- NIEMALS eigene Buttons, Inputs, Cards bauen
- IMMER semantische Farben: bg-primary, text-danger (NICHT bg-blue-600)
- Lies src/lib/design/DESIGN-SYSTEM.md für Details

## Testing — Hard Rules

- E2E Tests: Playwright gegen laufende App
- Unit Tests: echte Objekte, Mocks NUR für externe APIs
- NIEMALS Tests editieren um sie grün zu machen
- Tests co-located: tests/e2e/ für E2E, \*.test.ts neben Source für Unit

## Code — Hard Rules

- Komponenten unter 200 Zeilen, dann splitten
- ES Modules, kein CommonJS
- Feature Branches, nie direkt auf main
- Nach jeder Änderung: npm run check
- Forms: Progressive Enhancement mit SvelteKit Form Actions
- Server-Only Code: Immer in .server.ts oder server/ Verzeichnis[settings.local.json](../rss-content-hub/.claude/settings.local.json)

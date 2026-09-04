# sveltekit-starter

## Stack

- SvelteKit v2, Svelte 5 (Runes: $state, $derived, $effect, $props, $bindable)
- TypeScript strict mode
- Tailwind CSS v4
- Lucia Auth v3 + Drizzle Adapter
- Drizzle ORM + SQLite (lokal) / D1 (Cloudflare)
- Vitest (Unit) + Playwright (E2E)
- Cloudflare Workers Adapter (`@sveltejs/adapter-cloudflare` 7)
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

## Agent Loop (GitHub Actions)

Claude läuft unbeaufsichtigt über `.github/workflows/agent.yml`. Niemand beantwortet Rückfragen.

**Issue** (Label `ready`):

1. Issue lesen: `gh issue view <n> --json title,body,labels,comments`. Fehlen Akzeptanzkriterien: Kommentar mit der konkreten Frage, Label `needs-human` setzen, `ready` entfernen, Stopp.
2. Branch `claude/issue-<n>-<slug>` von main.
3. Umsetzen nach den Regeln oben. Verbindlich sind die Akzeptanzkriterien, nicht der Lösungsvorschlag im Issue: bauen, was in dieses Projekt passt und seinen Konventionen folgt, auch wenn das vom Vorschlag abweicht. Jede Abweichung im PR unter „Abweichungen vom Issue“ begründen. Gehört der Bedarf nicht in dieses Projekt: Kommentar mit Begründung, `needs-human`, `ready` entfernen, Stopp. Fehlt etwas in einer eigenen Lib (fullstack, flatdb, sveltekit-ai-orchestrator, element-js, element-js-ssr-renderer, element-library): Issue dort anlegen (`gh issue create --repo <owner/lib>`) mit Bedarf und hiesigem Kontext, höchstens ein unverbindlicher Vorschlag; minimalen Workaround mit `// UPSTREAM: <issue-url>` markieren, weitermachen. Nie auf Upstream warten.
4. `npm run check && npm test && npm run build` grün. Nach drei Fehlversuchen: Draft-PR öffnen, `needs-human`, Stopp.
5. Eigenen Diff reviewen: Security, tote Pfade, Fehlerbehandlung, Barrierefreiheit.
6. PR öffnen (`gh pr create`): Zusammenfassung, `Closes #<n>`, Testplan, Abschnitt „Abweichungen vom Issue“ (oder „keine“), explizit sagen, ob Auth, Payments, Schema oder Secrets berührt sind. Kein `@codex review` posten: Codex ignoriert Kommentare von Bots. Eddy fordert das Review an.

**Review** (Review auf einem `claude/*`-PR):

1. Reviews und Inline-Kommentare seit dem letzten Commit lesen (`gh pr view <n> --json reviews,comments`, `gh api repos/{owner}/{repo}/pulls/<n>/comments`). Gibt es nichts zu tun: Stopp, kein Kommentar.
2. Jeden Punkt beheben oder im Thread begründen, warum nicht. Security-Findings nie abtun.
3. Check, Test, Build grün, pushen, dann ein PR-Kommentar: `Review-Findings umgesetzt in <kurzer sha>, bereit für Re-Review.` Nach drei Fix-Runden auf einem PR: `needs-human`, Stopp.

**Immer:**

- Umfang und Sicherheit: vor der Umsetzung den Scope einschätzen. Braucht das Issue mehr als einen PR (mehrere unabhängige Teile, mehr als ca. 15 Dateien): Sub-Issues mit `gh issue create` anlegen (das erste mit `ready`, der Rest ohne Label), die Liste als Kommentar ans Eltern-Issue, nur das erste bearbeiten. Nach dem ersten sinnvollen Schritt committen und pushen und weiter pushen, damit nichts verloren geht, wenn der Run sein Turn-Limit erreicht.
- Nie fragen. Blockiert heißt: Frage mit Optionen als Kommentar, `needs-human`, Stopp.
- Ein Issue, ein Branch, ein PR. Conventional Commits (`feat:`, `fix:`, `chore:`, ...). Nie force-pushen. Nie Secrets committen.
- Gemergt wird von Eddy, nicht vom Agenten.
- Nie Dateien unter `.github/workflows/` anlegen oder ändern: der App-Token hat keinen `workflows`-Scope, der Push wird abgelehnt. Die nötige Workflow-Änderung als `needs-human`-Issue beschreiben und weitermachen.

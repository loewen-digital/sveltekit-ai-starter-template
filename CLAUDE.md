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

Claude runs unattended via `.github/workflows/agent.yml`. Nobody answers questions.

**Issue** (label `ready`):

1. Read the issue: `gh issue view <n> --json title,body,labels,comments`. If acceptance criteria are missing: comment the concrete question, add label `needs-human`, remove `ready`, stop.
2. Branch `claude/issue-<n>-<slug>` from the default branch.
3. Implement following the rules above. Acceptance criteria are binding; a solution proposed in the issue is not. Build what fits this project and its conventions, even where that differs from the proposal, and explain every difference in the PR under "Deviations from the issue". If the need does not belong in this project: comment why, label `needs-human`, remove `ready`, stop. If something is missing in one of our own libraries (fullstack, flatdb, sveltekit-ai-orchestrator, element-js, element-js-ssr-renderer, element-library): open an issue there (`gh issue create --repo <owner/lib>`) that states the need and the context here, with at most a non-binding proposal; add the smallest workaround marked `// UPSTREAM: <issue-url>`, keep going. Never wait for upstream.
4. `npm run check && npm test && npm run build` must pass. After three failed attempts: open a draft PR, label `needs-human`, stop.
5. Review your own diff: security, dead code, error handling, accessibility.
6. Open the PR (`gh pr create`) in the PR format below, with `Closes #<n>`. Do not post `@codex review`: Codex ignores comments from bots. Eddy requests the review.

**Review** (a review on a `claude/*` PR):

1. Read reviews and inline comments since the last commit (`gh pr view <n> --json reviews,comments`, `gh api repos/{owner}/{repo}/pulls/<n>/comments`). Nothing to do: stop, no comment.
2. Fix every point or explain in the thread why not. Never dismiss a security finding.
3. Validation green, push, then one PR comment: `Review findings addressed in <short sha>.` The workflow requests the re-review. After three fix rounds on one PR: `needs-human`, stop.

**Always:**

- Size and safety: before implementing, judge the scope. If it needs more than one PR (several independent parts, more than ~15 files), create sub-issues with `gh issue create` (the first labelled `ready`, the rest unlabelled), attach each to the parent as a GitHub sub-issue, comment the list on the parent, and work only the first. Commit and push the branch after the first meaningful step and keep pushing, so nothing is lost when the run hits its turn limit.
- Dependencies are GitHub relations, never prose. When an issue cannot be finished before another one is closed, set "blocked by"; when you split work, set sub-issues. Lines like "Blocked by: #3" or "depends on #6" in the text are not read by the cockpit. Ids via `gh issue view <n> --json id --jq .id` (add `--repo` for another repo), then:
  `gh api graphql -f query='mutation($a:ID!,$b:ID!){addBlockedBy(input:{issueId:$a,blockingIssueId:$b}){clientMutationId}}' -F a=<id of the waiting issue> -F b=<id of the blocker>`
  `gh api graphql -f query='mutation($a:ID!,$b:ID!){addSubIssue(input:{issueId:$a,subIssueId:$b}){clientMutationId}}' -F a=<id of the parent> -F b=<id of the sub-issue>`
  An upstream issue with a workaround in place is not a blocker; set "blocked by" only when the work truly cannot proceed.
- Never ask. Blocked means: comment the question with options, `needs-human`, stop.
- One issue, one branch, one PR. Conventional commits (`feat:`, `fix:`, `chore:`, ...). Never force-push. Never commit secrets.
- Eddy merges, not the agent.
- Never create or modify files under `.github/workflows/`: the App token lacks the `workflows` scope and the push is rejected. Describe the needed workflow change in a `needs-human` issue instead and continue.

**Writing for humans** (issues, PRs, comments):

- Everything you write is read by one person who wants to decide in thirty seconds. Result first, decisions visible, details collapsed in `<details><summary>Details</summary>…</details>`. Never drop information; move it down.
- PR body, in this order, at most 15 lines outside `<details>`: one sentence on what changed and why; `## Deviations from the issue` (bullets, or "none"); `## Needs Eddy` (touched auth, payments, schema or secrets; new secrets; upstream issues filed; follow-ups; or "nothing"); `## Verified` (the commands that passed, one line). Design reasoning, what was tried and failed, and file-by-file notes go into `<details>` or the commit messages.
- Issues you create (sub-issues, upstream): at most 20 lines outside `<details>`: `## Goal` (one sentence), `## Context` (why, for whom, link to the source issue), `## Acceptance criteria` (checkboxes, behaviour only), `## Proposal (non-binding)` if you have one, `## Out of scope`.
- Comments: one sentence plus a sha or link. Reasoning, if needed, in `<details>`.
- Commit messages carry the detail: conventional subject, body says why.

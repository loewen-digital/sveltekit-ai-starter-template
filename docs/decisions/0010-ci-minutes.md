# 0010 · CI inside the Actions minutes: E2E on pull requests and tags only

## Context

GitHub Free gives the org 2.000 Actions minutes a month for all its private repos together; at 100 % every CI in the org stops until the next month. Every project created from this template inherited `ci.yml` (`verify` + `e2e` on every push to `main` and every pull request) and `deploy.yml` (a second full check-test-build on a tag). In anspiel that was 24 billed minutes per push and 1.318 minutes in 13 days of October 2026, 67 % of the org's quota from one app. Billing rounds every job up to a full minute, so the job count costs as much as the job length. Eddy decided on 2026-10-13 to carry one CI shape in the cockpit (loewen-digital/agent-loop, `snippets/ci.yml`) and roll it out, this template first.

## Decision

- One workflow per trigger: `ci.yml` holds `verify`, `e2e` and `deploy`; `deploy.yml` is deleted. The deploy `needs` both gates instead of repeating check, tests and build, which saves a whole job per release. Only `preview.yml` (per-PR Worker Preview), `release.yml` and `agent.yml` stay separate, because they answer to other events.
- `e2e` runs on every event except a push to a branch: pull requests and tags are where it gates something, a push to `main` is a merge of a pull request that already ran it. Target: at most 7 billed minutes per push to `main`.
- `push` carries `paths-ignore: ["docs/**", "**.md"]`, so a docs-only commit runs nothing. GitHub ignores path filters on tag pushes, so a release always runs.
- `concurrency` cancels a superseded run per branch or pull request, never for a tag: a release run must finish, and two tags in a row are two releases.
- The Playwright report is uploaded only `if: failure()`, 7 days: artifact storage counts against the same quota.
- No `schedule` trigger in Actions. A cron runs on billed runner minutes even when it finds nothing to do; in a Worker app a recurring job belongs in the Worker as a Cron Trigger, where it is free and has the app's bindings.

## Consequences

- A regression that only E2E catches reaches `main` when the pull request was merged without one, and surfaces on the next PR or tag instead. Accepted: the alternative costs the org's quota.
- The deploy job rebuilds, because artifacts between jobs would cost upload and download time for a build of this size.
- This supersedes the `deploy.yml` half of [decision 0009](0009-workers-previews.md); Previews, bindings and the skip-without-secrets behaviour are unchanged.
- Workflow files are out of reach for the agent loop (the App token has no `workflows` scope), so this shape and every later change to it land from a local session.

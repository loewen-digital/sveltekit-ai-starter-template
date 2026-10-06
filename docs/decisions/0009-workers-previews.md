# 0009 · Cloudflare Workers only, one Worker Preview per pull request

## Context

The loewen-digital apps were split between Cloudflare Pages and Workers. Pages stays supported but gets no new features; Workers has Worker Previews since 2026-09-22 (`wrangler preview`, Wrangler ≥ 4.135): an isolated environment per branch under the same Worker, with its own bindings, variables, secrets, URL and logs. Eddy decided on 2026-10-06 to deploy every app as a Worker, with a Preview per pull request, this template first (loewen-digital/agent-loop, T-020).

## Decision

- Production deploys with `wrangler deploy` on a tag `v<version>` (`deploy.yml`); pull requests get a Preview named `pr-<number>` (`preview.yml`), its URL as a PR comment, deleted when the PR closes. Both workflows skip the Cloudflare steps while the repo has no `CLOUDFLARE_API_TOKEN`, so the template itself stays green.
- A Preview gets only the bindings of the `previews` block in `wrangler.jsonc`, never production's: the R2 binding `CONTENT` points at `sveltekit-starter-content-preview` there. A binding without a counterpart is absent in the Preview, which fails loudly instead of touching production data.
- Not used: Version URLs (`wrangler versions upload`), which share production bindings, and a second Worker through `--env preview`, which would be one fixed stage instead of one environment per PR.

## Consequences

- Every new binding is declared twice, in the top level and in `previews`, with a resource of its own; `AGENTS.md` says so.
- Secrets a Preview needs (mail provider) are set once for all Previews with `npx wrangler preview base-config secret put <KEY>`; production secrets with `npx wrangler secret put <KEY>`.
- Cron Triggers, Routes and Queue consumers stay production-only in a Preview; Service Bindings call the production of the bound Worker. The Free plan keeps 100 Previews per Worker, the oldest is dropped first.
- The PR comment is edited in place (`gh pr comment --edit-last`), so a PR carries one preview comment, not one per push.

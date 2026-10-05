# 0008 · SvelteKit 3: explicit env, bindings from `cloudflare:workers`, preview is `wrangler dev`

## Context

SvelteKit 3.0 is `latest` since 2026-10-01. Eddy decided on 2026-10-05 to move every loop repo to it, with this template as the pilot (loewen-digital/agent-loop, T-019). Kit 3 drops `svelte.config.js`, `$lib` and `$app/stores`, deprecates `$env/*`, and needs `adapter-cloudflare` 8, which takes the bindings off `event.platform`.

## Decision

- `npx sv migrate sveltekit-3` did the mechanical part: config into `sveltekit({ ... })` in `vite.config.ts`, `#lib/….js`, `$app/state`, `$app/env`, hook types from `@sveltejs/kit/hooks`, `tsconfig.json` on `$app/tsconfig`. By hand: it had replaced the Vite+ alias of `vite` in `package.json` with `^8.0.12` (restored), and it does not see `event.platform.env`, a `<script module>` and an ambient `.d.ts`.
- Environment variables are declared in `src/env.ts`, all nine as optional. Which mail variables are required depends on the provider; `provider.ts` checks that and names the fix, which a refused start would not.
- The R2 binding is read from `cloudflare:workers`. Its type is generated, not written by hand: `npm run check` runs `wrangler types`, which writes `worker-configuration.d.ts` (Workers runtime plus the bindings of `wrangler.jsonc`, about 600 kB, ignored by git like `.svelte-kit`).
- `npm run preview` is `wrangler dev` instead of `vp preview`. Vite's preview server runs the build on Node, which cannot load `cloudflare:workers` (sveltejs/kit#17271); the Workers runtime is where the build runs anyway.

## Consequences

- An editor shows `cloudflare:workers` as unresolved until `npm run check` has run once.
- `tsconfig.json` turns `allowJs` off. With it on, the generated file's `mainModule` type pulls the build output into the type check, and `npm run check` fails after every build.
- Kit 3 answers a failed form action with the status given to `fail()` and logs every request in dev, so `400 POST /login` in the terminal is a rejected form, not a bug.
- `tsconfig.json` has `skipLibCheck` through `$app/tsconfig`: a broken import inside a `.d.ts` is silent and turns the type into `any`. After a migration, grep the `.d.ts` files.
- Verified on the build in workerd with a local R2 bucket: the E2E suite runs against `wrangler dev` as it does against `npm run dev`. There, one to three of the 27 tests time out per run because a click on a submit button is lost; the SvelteKit 2 build does the same, so it is not part of this change.

# Changelog

All notable changes to sveltekit-ai-starter-template, newest first. SemVer, 0.x is pre-release. The heading
format is a contract, keep it: `## v<Version> · <YYYY-MM-DD> · <Title>`. Lines under
`## Unreleased` move under the next version heading at release; the version in `package.json`
is the topmost released one here.

## Unreleased

- `Button` wraps element-library's `el-button` and uses its vocabulary: `variant` default/primary/success/neutral/warning/danger/text and `size` small/medium/large (was primary/secondary/danger/ghost and sm/md/lg). Submit buttons keep a hidden native submit button in light DOM, so Enter submits and forms submit before hydration and without JavaScript; see [decision 0002](docs/decisions/0002-button-wrapper-with-light-dom-submit.md) (webtides/element-library#86).
- The design system is moving to `@webtides/element-library` Web Components: `src/hooks.server.ts` pre-renders every `el-*` element on a page as Declarative Shadow DOM through `@webtides/element-js-ssr-renderer`, and the root layout upgrades them on the client, so they hydrate instead of rendering from scratch and work on Cloudflare Workers. Pages can use any element-library tag directly. The theme is `@webtides/element-library/themes/default.css` plus the project override `src/lib/design/theme.css`; Tailwind's semantic colours (`bg-primary`, `text-danger`, …) alias the `--el-*` tokens, and dark mode follows `color-scheme` via `light-dark()`. Missing upstream type declarations are shimmed in `src/lib/design/vendor.d.ts` (webtides/element-library#85, webtides/element-js-ssr-renderer#13). Component replacement follows.
- Passwords are hashed with scrypt from `node:crypto` instead of `@node-rs/argon2`, so the app runs on Cloudflare Workers (`wrangler dev` and deploys were broken). Existing argon2 hashes no longer verify, re-register local users. The `prebuild` step and the wasm package are gone. See [decision 0001](docs/decisions/0001-scrypt-instead-of-argon2.md).
- Agent rules live in `AGENTS.md`; `CLAUDE.md` only imports it. The Codex review rules are a section of the same file.

# Changelog

All notable changes to sveltekit-ai-starter-template, newest first. SemVer, 0.x is pre-release. The heading
format is a contract, keep it: `## v<Version> · <YYYY-MM-DD> · <Title>`. Lines under
`## Unreleased` move under the next version heading at release; the version in `package.json`
is the topmost released one here.

## Unreleased

- Passwords are hashed with scrypt from `node:crypto` instead of `@node-rs/argon2`, so the app runs on Cloudflare Workers (`wrangler dev` and deploys were broken). Existing argon2 hashes no longer verify, re-register local users. The `prebuild` step and the wasm package are gone. See [decision 0001](docs/decisions/0001-scrypt-instead-of-argon2.md).
- Agent rules live in `AGENTS.md`; `CLAUDE.md` only imports it. The Codex review rules are a section of the same file.

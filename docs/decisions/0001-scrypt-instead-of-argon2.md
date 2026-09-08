# 0001 · scrypt via node:crypto instead of @node-rs/argon2

## Context

`@node-rs/argon2` cannot run on Cloudflare Workers (#12). Wrangler resolves it to its WASI browser build: version 2.0.2 imports the `.wasm` with a `?url` suffix wrangler's esbuild has no loader for; version 2.2.0 bundles but throws `Invalid URL string` at worker startup because it needs `fetch` relative to `import.meta.url`, `SharedArrayBuffer` and Web Workers, none of which workerd provides. Options: a bundler workaround (dead end, see above), wait for #2 (auth via `@loewen-digital/fullstack`, which brings its own hashing), or switch the hash function now.

## Decision

Hash with scrypt from `node:crypto` (Node defaults, 16-byte salt, 64-byte key), stored as `scrypt:<salt_hex>:<key_hex>`. That is the exact format fullstack uses, and `node:crypto` is available in workerd under `nodejs_compat` (about 30 ms per hash, measured with `wrangler dev`).

## Consequences

- `wrangler dev` and Workers deploys work. No prebuild step, no wasm package, no `optionalDependencies`.
- Existing argon2 hashes no longer verify. Acceptable for a template without user data; re-register local users.
- #2 needs no hash migration.
- Argon2id is the OWASP first choice, scrypt its listed alternative. Revisit if a Workers-capable argon2 build appears.

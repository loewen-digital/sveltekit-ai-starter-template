import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const PKG = '@node-rs/argon2-wasm32-wasi';

// The Cloudflare worker bundle resolves @node-rs/argon2 through its `browser`
// entry, which is a bare `export * from '@node-rs/argon2-wasm32-wasi'` — so
// esbuild has to resolve that package or the adapter build fails.
//
// npm refuses to install it on a real CPU because it declares cpu: ["wasm32"].
// As a hard dependency that turns every `npm install` on x64/arm64 into an
// EBADPLATFORM error, so it lives in optionalDependencies (where npm silently
// skips it) and gets pulled in here with the platform check overridden.
if (existsSync(new URL(`../node_modules/${PKG}/package.json`, import.meta.url))) {
	process.exit(0);
}

console.log(`[prebuild] installing ${PKG} for the Cloudflare bundle...`);
execFileSync('npm', ['install', '--no-save', '--cpu=wasm32', PKG], { stdio: 'inherit' });

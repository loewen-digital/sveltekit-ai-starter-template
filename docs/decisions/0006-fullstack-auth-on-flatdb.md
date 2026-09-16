# 0006 · fullstack auth on flatdb replaces Lucia and Drizzle in one step

## Context

#2 (auth via `@loewen-digital/fullstack`) and #3 (data via `@loewen-digital/flatdb` on R2) were filed as two issues, each blocked by the other. The auth tables were the only database use, so a state with one done and the other not is neither green nor useful. #2 names four fullstack modules (auth, session, security, mail) and asks for the current CSRF behaviour; #3 mentions a seed script the template never had.

## Decision

One change for both issues. `auth` runs on `createFlatdbAuthAdapter` over the `users`, `sessions` and `tokens` collections; the database, the adapter and `createAuth` are built per request in the auth handle, because flatdb caches a collection's index per instance. `security` supplies only the rate limiter: CSRF stays SvelteKit's origin check, since fullstack's check expects an `x-csrf-token` header that native form posts never carry. The `session` module (flash messages, old input) is not wired: since decision 0003 every message renders inline from the action result, so it would be a second cookie and a secret with no reader. `mail` supplies the instance and the Resend driver; the console driver stays ours so the link is logged on its own line, SMTP stays ours for `worker-mailer` (fullstack's needs nodemailer). No seed script, as before.

## Consequences

- `lucia`, `drizzle-*`, `better-sqlite3` and the D1 binding are gone, and with them the better-sqlite3 crash on Node 24 during E2E. Local data is JSON under `.data/`, written through `AtomicFsAdapter` (temp file plus rename, compare-and-swap on `_index.json`): flatdb's `FsAdapter` tears the index under parallel requests, which the Playwright suite hits every run (loewen-digital/flatdb#10). Tests use `MemoryAdapter`, production the R2 bucket `CONTENT`.
- Sessions no longer extend on use: seven days from login, then a new login. Reset and verification tokens are stored raw (loewen-digital/fullstack#27); a new link replaces the older ones of its type (fullstack#26); a reset revokes every session (fullstack#25). Two overlapping registrations of one address can both succeed (loewen-digital/flatdb#9).
- Users, sessions and tokens in D1 or `local.db` do not carry over; re-register.

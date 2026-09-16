# SvelteKit Starter Template

Opinionated SvelteKit starter with auth, a document database, a design system, tests and Cloudflare deployment.

## Quick Start

```bash
npm install
npm run dev
```

No database to set up: documents are written as JSON files under `.data/`.

## Scripts

| Command            | Description                           |
| ------------------ | ------------------------------------- |
| `npm run dev`      | Start dev server                      |
| `npm run build`    | Production build (Cloudflare Workers) |
| `npm run check`    | svelte-check + TypeScript             |
| `npm run lint`     | ESLint + Prettier                     |
| `npm run format`   | Format code with Prettier             |
| `npm test`         | Run Vitest unit tests                 |
| `npm run test:e2e` | Run Playwright E2E tests              |

## Tech Stack

- **Framework:** SvelteKit v2, Svelte 5 (Runes)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **Design system:** @webtides/element-library Web Components, server-rendered via @webtides/element-js-ssr-renderer
- **Auth:** @loewen-digital/fullstack (auth, security, mail) with its SvelteKit adapter
- **Database:** @loewen-digital/flatdb, JSON documents with zod schemas; `.data/` locally, Cloudflare R2 in production
- **Testing:** Vitest (Unit) + Playwright (E2E)
- **Deployment:** Cloudflare Workers

## Project Structure

```
src/
├── lib/
│   ├── design/           # Design system
│   │   ├── components/   # SubmitButton (upstream workaround), Card, Spinner, EmptyState; everything else is <el-…> directly
│   │   └── DESIGN-SYSTEM.md
│   ├── features/         # Feature modules
│   │   └── auth/         # Authentication (fullstack auth on flatdb)
│   ├── server/           # Server-only code
│   │   ├── collections/  # zod schemas, one file per collection
│   │   ├── db.ts         # Opens the collections per request (FsAdapter, R2Adapter)
│   │   └── email/        # Mail providers and templates
│   └── shared/           # Shared types and utils
├── routes/
│   ├── (app)/            # Protected routes (requires auth)
│   ├── (auth)/           # Auth routes (login, register)
│   └── api/              # API endpoints
└── tests/
    └── e2e/              # Playwright E2E tests
```

## Auth

Session-based authentication with email + password, provided by
[`@loewen-digital/fullstack`](https://github.com/loewen-digital/fullstack):

- **Register:** `/register`
- **Login:** `/login`
- **Logout:** POST to `/logout`
- **Protected routes:** Everything under `(app)/` requires authentication

Sessions are documents in the `sessions` collection; the `fs_token` cookie
carries an opaque token and lasts seven days. The auth handle in
`src/lib/features/auth/server/middleware.ts` builds the stack per request and
puts `db`, `auth`, `authDb`, `authSession` and `user` on `event.locals`.

## Data

[`@loewen-digital/flatdb`](https://github.com/loewen-digital/flatdb) stores
every document as a JSON file: one folder per collection, one file per
document, plus an `_index.json` the queries read. Collections are zod schemas
in `src/lib/server/collections/`; a field a schema does not declare is stripped
on write, so add new fields there first.

- **Local development:** `.data/` in the project (ignored by git). Open the
  files to inspect or edit data; delete the folder to start over. Writes go
  through `src/lib/server/atomic-fs-adapter.ts`, which adds atomic writes and
  compare-and-swap until flatdb's `FsAdapter` has them
  (loewen-digital/flatdb#10).
- **Tests:** `MemoryAdapter`, nothing touches the disk.
- **Production:** the R2 bucket bound as `CONTENT` in `wrangler.jsonc`. See
  Deployment.

The database is opened per request (`locals.db`), never at module level:
flatdb caches a collection's index in memory, and on Workers another isolate
may have written in the meantime.

## Email

Password reset and email verification need a delivery provider.

- **Local development:** nothing to configure. The console provider logs each
  message and prints the reset/verification link on its own line so you can
  click it straight out of the terminal.
- **Production:** configure Resend or SMTP (below). If neither a provider nor
  `EMAIL_PROVIDER=console` is configured, the app raises a configuration error
  instead of accepting mail it cannot deliver.

Setting both `RESEND_API_KEY` and `SMTP_HOST` is rejected — set
`EMAIL_PROVIDER` so the choice is explicit rather than a matter of precedence.

### Resend (HTTP API)

```bash
EMAIL_FROM="Acme <noreply@acme.com>"
RESEND_API_KEY=re_xxxxxxxxxxxx
```

Easiest to operate, and the only option here that reports bounces and delivery
events back via webhooks.

### SMTP (any mail server)

```bash
EMAIL_FROM="Acme <noreply@acme.com>"
SMTP_HOST=smtp.acme.com
SMTP_PORT=587            # optional, defaults to 587
SMTP_USERNAME=mailer@acme.com
SMTP_PASSWORD=xxxxxxxx
```

Use this when the deployment has to send through mail infrastructure you do not
choose — a client's own server, a corporate relay, or the SMTP endpoint of a
provider that has no adapter here. Host and credentials are the whole
configuration; no code changes.

Two constraints come from the runtime, not from this template:

- **SMTP does not work under `npm run dev`.** It needs Cloudflare's TCP socket
  API (`cloudflare:sockets`), which Node does not have. Develop against
  `EMAIL_PROVIDER=console`, and use `npm run build && npx wrangler dev` when
  you need to exercise SMTP locally. The provider says so explicitly if you
  try.
- **Port 25 is blocked** by Cloudflare. Use 587 (STARTTLS) or 465 (implicit
  TLS). TLS mode is derived from the port; `SMTP_SECURE` overrides it.

Credentials are only ever sent after TLS is established — 465 starts inside
TLS, everything else negotiates STARTTLS first.

Compared with the HTTP provider, expect a full SMTP handshake per message, a
per-isolate cap on concurrent TCP connections, and no delivery webhooks.

### Adding another provider

`sendEmail()` talks to a fullstack `MailDriver` with a `name`, so swapping
vendors is local:

1. Take a driver from `@loewen-digital/fullstack/mail` (Resend and Postmark ship
   there and run on Workers because they use plain `fetch`), or add
   `src/lib/server/email/providers/<name>.ts` implementing `EmailProvider`.
2. Return it from `resolveEmailProvider()` in `src/lib/server/email/provider.ts`.

The SMTP provider takes its transport as an injectable argument, which is how it
is unit tested without opening a socket.

## Design System

See [`src/lib/design/DESIGN-SYSTEM.md`](src/lib/design/DESIGN-SYSTEM.md) for components and usage.

Import components:

```svelte
<script lang="ts">
	import { Button, Input, Card, Alert } from '$lib/design/components';
</script>
```

## Deployment

Configured for Cloudflare Workers. Create the R2 bucket once (the name is set
in `wrangler.jsonc`), then build and deploy:

```bash
npx wrangler r2 bucket create sveltekit-starter-content
npm run build
npx wrangler deploy
```

To serve the production build locally (needed to exercise anything that
depends on the Workers runtime, like SMTP — see below):

```bash
npm run build
npx wrangler dev
```

`npm run preview` runs a plain Vite preview server instead: fine for
checking pages and forms, but it runs on Node, not the Workers runtime, so
it can't exercise Workers-only APIs (`cloudflare:sockets`, R2, etc.).

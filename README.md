# SvelteKit Starter Template

Opinionated SvelteKit starter with Auth, DB, Design System, Testing and Cloudflare deployment.

## Quick Start

```bash
npm install
npm run db:migrate
npm run dev
```

## Scripts

| Command               | Description                           |
| --------------------- | ------------------------------------- |
| `npm run dev`         | Start dev server                      |
| `npm run build`       | Production build (Cloudflare Workers) |
| `npm run check`       | svelte-check + TypeScript             |
| `npm run lint`        | ESLint + Prettier                     |
| `npm run format`      | Format code with Prettier             |
| `npm test`            | Run Vitest unit tests                 |
| `npm run test:e2e`    | Run Playwright E2E tests              |
| `npm run db:generate` | Generate Drizzle migrations           |
| `npm run db:migrate`  | Apply Drizzle migrations              |
| `npm run db:studio`   | Open Drizzle Studio                   |

## Tech Stack

- **Framework:** SvelteKit v2, Svelte 5 (Runes)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **Auth:** Lucia Auth v3 + Drizzle Adapter
- **Database:** Drizzle ORM + SQLite (local) / D1 (Cloudflare)
- **Testing:** Vitest (Unit) + Playwright (E2E)
- **Deployment:** Cloudflare Workers

## Project Structure

```
src/
├── lib/
│   ├── design/           # Design system
│   │   ├── components/   # Button, Input, Card, Alert, Modal, Spinner, EmptyState
│   │   └── DESIGN-SYSTEM.md
│   ├── features/         # Feature modules
│   │   └── auth/         # Authentication (Lucia + Drizzle)
│   ├── server/           # Server-only code
│   │   └── db/           # Drizzle ORM + schema
│   └── shared/           # Shared types and utils
├── routes/
│   ├── (app)/            # Protected routes (requires auth)
│   ├── (auth)/           # Auth routes (login, register)
│   └── api/              # API endpoints
└── tests/
    └── e2e/              # Playwright E2E tests
```

## Auth

Session-based authentication with email + password:

- **Register:** `/register`
- **Login:** `/login`
- **Logout:** POST to `/logout`
- **Protected routes:** Everything under `(app)/` requires authentication

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

`sendEmail()` talks to an `EmailProvider`, so swapping vendors is local:

1. Add `src/lib/server/email/providers/<name>.ts` implementing `EmailProvider`.
2. Return it from `resolveEmailProvider()` in `src/lib/server/email/provider.ts`.

The Resend adapter uses plain `fetch` rather than an SDK so it runs unchanged on
the Cloudflare Workers runtime — a good template to copy. Both shipped adapters
take their transport as an injectable argument, which is how they are unit
tested without touching the network.

## Design System

See [`src/lib/design/DESIGN-SYSTEM.md`](src/lib/design/DESIGN-SYSTEM.md) for components and usage.

Import components:

```svelte
<script lang="ts">
	import { Button, Input, Card, Alert } from '$lib/design/components';
</script>
```

## Deployment

Configured for Cloudflare Workers. Update `wrangler.jsonc` with your D1 database ID, then:

```bash
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
it can't exercise Workers-only APIs (`cloudflare:sockets`, D1, etc.).

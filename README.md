# SvelteKit Starter Template

Opinionated SvelteKit starter with Auth, DB, Design System, Testing and Cloudflare deployment.

## Quick Start

```bash
npm install
npm run db:migrate
npm run dev
```

## Scripts

| Command               | Description                   |
| --------------------- | ----------------------------- |
| `npm run dev`         | Start dev server              |
| `npm run build`       | Production build (Cloudflare) |
| `npm run check`       | svelte-check + TypeScript     |
| `npm run lint`        | ESLint + Prettier             |
| `npm run format`      | Format code with Prettier     |
| `npm test`            | Run Vitest unit tests         |
| `npm run test:e2e`    | Run Playwright E2E tests      |
| `npm run db:generate` | Generate Drizzle migrations   |
| `npm run db:migrate`  | Apply Drizzle migrations      |
| `npm run db:studio`   | Open Drizzle Studio           |

## Tech Stack

- **Framework:** SvelteKit v2, Svelte 5 (Runes)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **Auth:** Lucia Auth v3 + Drizzle Adapter
- **Database:** Drizzle ORM + SQLite (local) / D1 (Cloudflare)
- **Testing:** Vitest (Unit) + Playwright (E2E)
- **Deployment:** Cloudflare Pages

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

## Design System

See [`src/lib/design/DESIGN-SYSTEM.md`](src/lib/design/DESIGN-SYSTEM.md) for components and usage.

Import components:

```svelte
<script lang="ts">
	import { Button, Input, Card, Alert } from '$lib/design/components';
</script>
```

## Deployment

Configured for Cloudflare Pages. Update `wrangler.toml` with your D1 database ID, then:

```bash
npm run build
npx wrangler pages deploy
```

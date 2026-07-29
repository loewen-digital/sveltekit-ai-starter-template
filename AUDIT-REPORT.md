# Project Audit Report — sveltekit-ai-starter-template

> Generiert am: 2026-07-29
> Projekt: SvelteKit AI Starter Template (`sveltekit-starter` v0.0.1)
> Kontext: Statusbericht — Stand, Qualität, offene Punkte

---

## Executive Summary

Ein kompaktes, sauber strukturiertes SvelteKit-Starter-Template (~2.250 LOC) mit vollständigem Auth-Stack (Registrierung, Login, E-Mail-Verifizierung, Passwort-Reset), Profilverwaltung, Design System, Rate Limiting und Cloudflare-Deployment-Setup. Die Codequalität ist hoch: TypeScript strict ohne Fehler, ESLint sauber, 23/23 Unit-Tests grün, Production-Build funktioniert. Die eigenen Architektur-Regeln aus CLAUDE.md (Feature-Struktur, Svelte 5 Runes, Design-System-Komponenten) werden konsequent eingehalten.

Drei Punkte stehen einem "fertig"-Status im Weg: (1) `npm ci` schlägt auf normalen Maschinen fehl (falsch deklarierte wasm32-Dependency), (2) die E2E-Suite blockiert sich selbst am eigenen Rate Limiter (9 von 19 Tests rot), (3) der E-Mail-Versand ist nur ein Stub — Passwort-Reset und Verifizierung funktionieren in Produktion nicht. Dazu kommt strategisch: Lucia v3 ist offiziell deprecated.

**Gesamtbewertung:** 🟡 Akzeptabel — solide Basis, aber mit klaren Blockern vor Produktivnutzung

---

## 1. Stack Overview

| Eigenschaft | Wert |
|---|---|
| Framework | SvelteKit v2, Svelte 5 (Runes) |
| Sprache | TypeScript (strict), 0 Check-Fehler |
| Styling | Tailwind CSS v4 |
| Auth | Lucia v3 (⚠️ deprecated) + Drizzle Adapter, Argon2id |
| Database | Drizzle ORM + better-sqlite3 (dev) / Cloudflare D1 (prod) |
| Testing | Vitest (3 Dateien, 23 Tests) + Playwright (19 E2E-Tests) |
| Deployment | Cloudflare Pages Adapter, wrangler.toml vorhanden |
| Projektgröße | ~2.250 LOC in src/, 190 LOC E2E-Tests |
| Git-Stand | 13 Commits, Feature-Branch-Workflow, sauberer Verlauf |

**Umgesetzte Features:** Register/Login/Logout, E-Mail-Verifizierung (+ Resend), Passwort-Reset, Profil (E-Mail-/Passwortänderung mit Re-Auth), Design System (9 Komponenten + Doku), Toast-System, Rate Limiting, strukturiertes Logging, Health-Endpoint, 2 DB-Migrationen.

---

## 2. Findings

### 🔴 Critical

**[C1] `npm ci` schlägt auf x64/arm64 fehl (EBADPLATFORM)**
- **Datei/Ort:** `package.json:43` — `@node-rs/argon2-wasm32-wasi` in `dependencies`
- **Beschreibung:** Das Paket deklariert `cpu: wasm32`. Als reguläre Dependency bricht `npm ci`/`npm install` auf jeder normalen Entwicklermaschine und in CI mit `EBADPLATFORM` ab. Installation gelingt nur mit `--force`.
- **Impact:** Frisches Klonen des Templates funktioniert nicht — für ein Starter-Template ein Blocker. Der Quick Start im README (`npm install`) schlägt fehl.
- **Empfehlung:** Paket nach `optionalDependencies` verschieben (npm überspringt dann inkompatible Plattformen) und verifizieren, dass der Cloudflare-Build es weiterhin auflöst.

**[C2] E2E-Suite blockiert sich am eigenen Rate Limiter — 9/19 Tests rot**
- **Datei/Ort:** `src/lib/server/rate-limit.ts:38` (10 POST/15 min/IP) vs. `tests/helpers/auth.ts` (jeder Test registriert + loggt ein)
- **Beschreibung:** Alle E2E-Tests laufen von derselben IP. Nach ~10 POSTs auf `/login`, `/register` antwortet die App mit 429 — verifiziert im Testlauf: Fehlerseiten zeigen `{"error":"Too many requests..."}`. Ergebnis: 10 passed, 9 failed (alle Profile-Tests + Login-Wrong-Password).
- **Impact:** Die E2E-Suite ist als Ganzes nicht lauffähig; Regressionen in Profile-/Login-Flows werden nicht mehr erkannt. Vermutlich seit dem Merge des Rate-Limiting-Features unbemerkt rot.
- **Empfehlung:** Rate Limiter im Testkontext deaktivierbar machen (z. B. ENV-Flag `RATE_LIMIT_DISABLED` nur außerhalb von Produktion) oder Limits testfreundlich konfigurierbar machen. Nicht die Tests ändern — der Limiter braucht den Bypass.

### 🟠 Warnings

**[W1] E-Mail-Versand ist ein Stub — Reset/Verifizierung in Produktion funktionslos**
- **Datei/Ort:** `src/lib/server/email/index.ts:16-31`
- **Beschreibung:** `sendEmail()` loggt nur. In Produktion wird lediglich `Email sending not configured` gewarnt, die Mail verschwindet.
- **Impact:** Passwort-Reset und E-Mail-Verifizierung sind produktiv Dead Ends; Nutzer, die ihr Passwort vergessen, sind ausgesperrt.
- **Empfehlung:** Provider anbinden (Resend/Postmark, TODO im Code zeigt bereits das Muster) — als bewusste Template-Lücke zumindest im README prominent dokumentieren.

**[W2] Lucia v3 und Drizzle-Adapter sind deprecated**
- **Datei/Ort:** `package.json:41,46`; npm-Warnung bei Installation
- **Beschreibung:** `lucia@3.2.2` und `@lucia-auth/adapter-drizzle` sind offiziell deprecated; das Lucia-Projekt empfiehlt die Migration auf eine eigene Session-Implementierung (dokumentierter Migrationsguide existiert).
- **Impact:** Keine Security-Fixes mehr; jedes aus dem Template gestartete Projekt erbt eine tote Auth-Dependency.
- **Empfehlung:** Auf handgerollte Sessions nach dem Lucia-Migrationsguide umstellen (~1–2 Tage; die Architektur mit `getLucia()`-Singleton und schlankem Middleware-Layer macht das gut machbar).

**[W3] Rate Limiting in Produktion (Cloudflare) faktisch wirkungslos; Lücken bei sensiblen Endpoints**
- **Datei/Ort:** `src/lib/server/rate-limit.ts:35-37`, `src/lib/features/auth/server/rate-limit-handle.ts:4`
- **Beschreibung:** In-Memory-Map ist auf Workers per-Isolate (im Code selbst korrekt dokumentiert). Zudem sind `/reset-password` und `/resend-verification` nicht in `RATE_LIMITED_PATHS` — Resend erlaubt unbegrenzten E-Mail-Versand pro Klick.
- **Impact:** Brute-Force-Schutz in Produktion nur kosmetisch; E-Mail-Spam über Resend möglich.
- **Empfehlung:** Für D1/Workers auf Durable Objects oder KV umstellen; `/reset-password` und `/resend-verification` in die Liste aufnehmen.

### 🟡 Info

**[I1] Prettier-Verstöße in 12 Dateien** — `npm run lint` schlägt fehl (nur Formatierung, kein ESLint-Fehler). Fix: `npm run format`. Verstößt gegen die eigene CLAUDE.md-Regel „Nach jeder Änderung: npm run check/lint".

**[I2] Kein CI/CD** — Kein `.github/workflows/`. Check, Lint, Tests und Build laufen nirgends automatisch; C1/C2 wären sonst aufgefallen.

**[I3] User-Enumeration beim Login via Timing** — `login/+page.server.ts:29-31`: bei unbekannter E-Mail wird kein Argon2-Verify ausgeführt → messbar schnellere Antwort. Fix: Dummy-Hash-Verify im Not-Found-Pfad. (Forgot-Password macht es richtig und verrät nichts.)

**[I4] Token-Tabellen ohne Indizes auf Suchspalten** — `schema.ts:29-46`: `hashed_token` und `user_id` der beiden Token-Tabellen werden per `WHERE` abgefragt, haben aber keinen Index; FKs ohne `onDelete: 'cascade'` (User-Löschung würde an FK-Constraints scheitern). Bei Template-Größe unkritisch, aber billig zu fixen.

**[I5] CLAUDE.md mit kaputtem Fragment** — Letzte Zeile enthält einen versehentlichen Link auf `../rss-content-hub/.claude/settings.local.json` mitten im Text der letzten Regel.

**[I6] wrangler.toml mit Platzhalter** — `database_id = "YOUR_D1_DATABASE_ID"` — erwartbar für ein Template, aber Deployment wurde damit nie durchgespielt.

### 🟢 Nice-to-have

- **Unit-Coverage der Auth-Services:** `password-reset.ts`, `email-verification.ts`, `profile.ts` haben keine Unit-Tests (nur E2E-Abdeckung). Die Testkultur (echte Objekte, keine Mock-Orgien) ist ansonsten vorbildlich.
- **`+error.svelte` / 404-Handling** ist minimal; Session-Cookie `path: '.'` funktioniert, `path: '/'` wäre expliziter.
- **README:** Auth-Abschnitt erwähnt Passwort-Reset/Verifizierung noch nicht.

---

## 3. Dependency Health

| Package | Version | Status |
|---|---|---|
| lucia | 3.2.2 | 🟠 deprecated |
| @lucia-auth/adapter-drizzle | 1.1.0 | 🟠 deprecated |
| @node-rs/argon2-wasm32-wasi | 2.0.2 | 🔴 bricht `npm ci` (falscher Dependency-Typ) |
| svelte / @sveltejs/kit | 5.x / 2.x | 🟢 aktuell |
| tailwindcss | 4.x | 🟢 aktuell |
| drizzle-orm / drizzle-kit | 0.38 / 0.30 | 🟡 funktional, Drizzle iteriert schnell |
| vite / vitest / playwright | 6.x / 3.x / 1.49 | 🟢 aktuell |

---

## 4. Database Assessment

| Metrik | Wert |
|---|---|
| Tabellen | 4 (user, session, password_reset_token, email_verification_token) |
| Migrationen | 2, konsistent mit Schema |
| Indexing | 🟡 session.user_id indiziert; Token-Tabellen ohne Indizes (I4) |
| Modellierung | 🟢 sauber: Tokens gehasht gespeichert, boolean/timestamp-Modes korrekt, updatedAt mit onUpdate |

---

## 5. Empfohlene Maßnahmen

| Prio | Maßnahme | Komplexität | Aufwand |
|---|---|---|---|
| 1 | C1: wasm32-Paket nach `optionalDependencies`, Install auf frischem Klon verifizieren | Niedrig | < 1 h |
| 2 | C2: Rate-Limiter-Bypass für Tests, E2E-Suite wieder grün ziehen | Niedrig | 1–2 h |
| 3 | I1: `npm run format` ausführen | Trivial | Minuten |
| 4 | I2: GitHub Actions (check + lint + test + build) | Niedrig | 0,5 Tag |
| 5 | W1: E-Mail-Provider anbinden oder Lücke im README dokumentieren | Niedrig | 0,5 Tag |
| 6 | W3: Rate-Limit-Pfade ergänzen; D1-taugliche Variante (KV/DO) | Mittel | 1 Tag |
| 7 | W2: Lucia v3 → eigene Sessions (offizieller Migrationsguide) | Mittel | 1–2 Tage |
| 8 | I3–I5: Timing-Fix, Indizes/Cascade, CLAUDE.md säubern | Niedrig | 0,5 Tag |

**Upgrade vs. Neuentwicklung:** Klar Weiterentwicklung — die Basis ist modern (Svelte 5, Tailwind 4, Drizzle) und die Architektur konsistent. Einziger struktureller Umbau ist der Lucia-Ersatz, und der ist überschaubar.

---

## 6. Fazit

Der Stand ist weiter, als „Starter-Template" vermuten lässt: alle Kern-Features sind implementiert, typisiert, dokumentiert und größtenteils getestet. Die Qualität des geschriebenen Codes ist überdurchschnittlich (konsequente Feature-Struktur, saubere Security-Grundlagen: Argon2id mit OWASP-Parametern, gehashte Tokens, keine Enumeration im Forgot-Password-Flow, Guards in Layout *und* Actions). Offen sind vor allem Integrations- und Betriebsthemen: Install-Blocker, rote E2E-Suite, E-Mail-Stub, fehlendes CI und die deprecated Auth-Bibliothek. Mit ca. 3–5 Arbeitstagen ist das Template produktionsreif.

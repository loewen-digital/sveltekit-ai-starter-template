# 0003 · Profile forms report success inline, from the server, instead of a toast

## Context

The profile forms showed their success as a client-side toast from the `use:enhance` callback, while every other form in the template shows the server's message inline. A submit that lands before hydration (or without JavaScript) posts natively, and the server-rendered page then showed nothing; the two "success toast" E2E specs failed on exactly that race. Showing both an inline message and a toast fixes the gap but reports one result twice. Options: keep the toast and skip applying the action result on success; keep both; or make the profile forms behave like the rest.

## Decision

`EmailForm` and `PasswordForm` render `form.emailSuccess` / `form.passwordSuccess` as an inline success `Alert` and no longer call `addToast`. The server's email message starts with "Email updated successfully" so both paths say the same thing. The toast store, `ToastContainer` and `Toast` stay as app infrastructure.

## Consequences

- Success is visible after a native submit, before hydration and without JavaScript; the E2E specs pass without edits.
- The template's own pages no longer show a toast; `addToast` is documented in `DESIGN-SYSTEM.md` for app code.

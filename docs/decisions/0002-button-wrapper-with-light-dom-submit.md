# 0002 · Button stays a Svelte wrapper around el-button, with a light-DOM submit button

## Context

Issue #7 asks for a wrapper "only where needed for onclick/form-action ergonomics; otherwise use the element directly". Every button in the template sits in a form that must work without JavaScript (SvelteKit form actions, progressive enhancement). `el-button` keeps its native `<button>` inside the shadow root, where it is no submit button of the form: Enter never submits, a click before the element upgrades is lost, and without scripting nothing submits (webtides/element-library#86). Options: use `<el-button>` directly and accept that forms need JavaScript and Enter; keep a wrapper that adds a light-DOM submit button; or build a light-DOM button locally (forbidden by the design rules).

## Decision

`Button.svelte` remains the single entry point. It renders `<el-button>` and, for `type="submit"`, a native `<button type="submit">` next to it. `theme.css` keeps that button `display: none` and, under `@media (scripting: none)`, shows it instead of the element. An inline script in `app.html` forwards clicks on a not-yet-upgraded `<el-button type="submit">` to `form.requestSubmit()`. The prop vocabulary is element-library's (`variant` default/primary/success/neutral/warning/danger/text, `size` small/medium/large), not the old primary/secondary/danger/ghost.

## Consequences

- Enter submits login, register and profile forms again; they also submit before hydration and without JavaScript.
- Everything is marked `// UPSTREAM` and goes once #86 lands; callers never see it.
- Callers migrate `ghost`→`text`, `sm/md/lg`→`small/medium/large`; svelte-check enforces it.

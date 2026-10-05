import { defineEnvVars } from '@sveltejs/kit/env';

// A variable without a schema must be set, or the app refuses to start. Every variable
// here may be missing, so each one passes its value through, `undefined` included.
const optional = { schema: (value: string | undefined) => value };

/**
 * Every environment variable the app reads; server code imports them from
 * `$app/env/private`. `.env.example` says what each one does. Which mail
 * variables are required depends on the provider and is checked in
 * `src/lib/server/email/provider.ts`, with messages that name the fix.
 */
export const variables = defineEnvVars({
	EMAIL_PROVIDER: optional,
	EMAIL_FROM: optional,
	RESEND_API_KEY: optional,
	SMTP_HOST: optional,
	SMTP_PORT: optional,
	SMTP_USERNAME: optional,
	SMTP_PASSWORD: optional,
	SMTP_SECURE: optional,
	DISABLE_RATE_LIMIT: optional
});

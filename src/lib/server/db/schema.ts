import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const userTable = sqliteTable('user', {
	id: text('id').primaryKey(),
	email: text('email').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
		.$onUpdateFn(() => new Date())
});

export const sessionTable = sqliteTable(
	'session',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => userTable.id),
		expiresAt: integer('expires_at').notNull()
	},
	(table) => [index('session_user_id_idx').on(table.userId)]
);

export const passwordResetTokenTable = sqliteTable('password_reset_token', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => userTable.id),
	hashedToken: text('hashed_token').notNull(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export const emailVerificationTokenTable = sqliteTable('email_verification_token', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => userTable.id),
	email: text('email').notNull(),
	hashedToken: text('hashed_token').notNull(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export type User = typeof userTable.$inferSelect;
export type Session = typeof sessionTable.$inferSelect;

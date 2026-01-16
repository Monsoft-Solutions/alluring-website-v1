import { index, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'

import { user } from './user.table'

/**
 * Account table for Better-Auth
 * Stores authentication provider accounts (email/password, OAuth, etc.)
 */
export const account = pgTable(
    'account',
    {
        id: text('id').primaryKey(),
        userId: text('user_id')
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        accountId: text('account_id').notNull(),
        providerId: varchar('provider_id', { length: 255 }).notNull(),

        // OAuth tokens
        accessToken: text('access_token'),
        refreshToken: text('refresh_token'),
        accessTokenExpiresAt: timestamp('access_token_expires_at'),
        refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
        scope: text('scope'),
        idToken: text('id_token'),

        // Password for email/password auth
        password: text('password'),

        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at')
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
    },
    (table) => [
        {
            userIdIdx: index('account_user_id_idx').on(table.userId),
            providerIdx: index('account_provider_idx').on(
                table.providerId,
                table.accountId
            ),
        },
    ]
)

export type Account = typeof account.$inferSelect
export type InsertAccount = typeof account.$inferInsert

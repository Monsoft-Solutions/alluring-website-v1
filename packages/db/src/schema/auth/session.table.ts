import { index, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'

import { user } from './user.table'

/**
 * Session table for Better-Auth
 * Stores active user sessions
 */
export const session = pgTable(
    'session',
    {
        id: text('id').primaryKey(),
        userId: text('user_id')
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        token: text('token').notNull().unique(),
        expiresAt: timestamp('expires_at').notNull(),
        ipAddress: varchar('ip_address', { length: 45 }),
        userAgent: text('user_agent'),
        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at')
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
    },
    (table) => [
        {
            userIdIdx: index('session_user_id_idx').on(table.userId),
            tokenIdx: index('session_token_idx').on(table.token),
            expiresAtIdx: index('session_expires_at_idx').on(table.expiresAt),
        },
    ]
)

export type Session = typeof session.$inferSelect
export type InsertSession = typeof session.$inferInsert

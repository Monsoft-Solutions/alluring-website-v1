import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

/**
 * Verification table for Better-Auth
 * Stores email verification and password reset tokens
 */
export const verification = pgTable(
    'verification',
    {
        id: text('id').primaryKey(),
        identifier: text('identifier').notNull(),
        value: text('value').notNull(),
        expiresAt: timestamp('expires_at').notNull(),
        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at')
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
    },
    (table) => [
        {
            identifierIdx: index('verification_identifier_idx').on(
                table.identifier
            ),
            expiresAtIdx: index('verification_expires_at_idx').on(
                table.expiresAt
            ),
        },
    ]
)

export type Verification = typeof verification.$inferSelect
export type InsertVerification = typeof verification.$inferInsert

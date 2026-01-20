import { index, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'

import { organization } from './organization.table'
import { user } from './user.table'

/**
 * Invitation statuses
 */
export const INVITATION_STATUSES = [
    'pending',
    'accepted',
    'rejected',
    'canceled',
] as const
export type InvitationStatus = (typeof INVITATION_STATUSES)[number]

/**
 * Invitation table for Better-Auth organization plugin
 * Stores pending invitations to join the organization
 */
export const invitation = pgTable(
    'invitation',
    {
        id: text('id').primaryKey(),
        email: varchar('email', { length: 255 }).notNull(),
        organizationId: text('organization_id')
            .notNull()
            .references(() => organization.id, { onDelete: 'cascade' }),
        role: varchar('role', { length: 50 }).notNull().default('viewer'),
        status: varchar('status', { length: 50 }).notNull().default('pending'),
        inviterId: text('inviter_id')
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        expiresAt: timestamp('expires_at').notNull(),
        createdAt: timestamp('created_at').notNull().defaultNow(),
    },
    (table) => [
        {
            emailIdx: index('invitation_email_idx').on(table.email),
            orgIdIdx: index('invitation_organization_id_idx').on(
                table.organizationId
            ),
            statusIdx: index('invitation_status_idx').on(table.status),
            expiresAtIdx: index('invitation_expires_at_idx').on(
                table.expiresAt
            ),
        },
    ]
)

export type Invitation = typeof invitation.$inferSelect
export type InsertInvitation = typeof invitation.$inferInsert

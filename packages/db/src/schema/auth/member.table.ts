import { index, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'

import { organization } from './organization.table'
import { user } from './user.table'

/**
 * Organization member roles
 */
export const MEMBER_ROLES = ['owner', 'admin', 'member'] as const
export type MemberRole = (typeof MEMBER_ROLES)[number]

/**
 * Member table for Better-Auth organization plugin
 * Links users to organizations with their roles
 */
export const member = pgTable(
    'member',
    {
        id: text('id').primaryKey(),
        userId: text('user_id')
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        organizationId: text('organization_id')
            .notNull()
            .references(() => organization.id, { onDelete: 'cascade' }),
        role: varchar('role', { length: 50 }).notNull().default('member'),
        createdAt: timestamp('created_at').notNull().defaultNow(),
    },
    (table) => [
        {
            userIdIdx: index('member_user_id_idx').on(table.userId),
            orgIdIdx: index('member_organization_id_idx').on(
                table.organizationId
            ),
            userOrgIdx: index('member_user_org_idx').on(
                table.userId,
                table.organizationId
            ),
        },
    ]
)

export type Member = typeof member.$inferSelect
export type InsertMember = typeof member.$inferInsert

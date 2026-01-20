import {
    boolean,
    index,
    pgTable,
    text,
    timestamp,
    varchar,
} from 'drizzle-orm/pg-core'

/**
 * Admin user roles
 * - admin: Full access to all features
 * - viewer: Read-only access
 */
export const USER_ROLES = ['admin', 'viewer'] as const
export type UserRole = (typeof USER_ROLES)[number]

/**
 * User table for Better-Auth
 * Stores admin dashboard user accounts
 */
export const user = pgTable(
    'user',
    {
        id: text('id').primaryKey(),
        name: varchar('name', { length: 255 }).notNull(),
        email: varchar('email', { length: 255 }).notNull().unique(),
        emailVerified: boolean('email_verified').notNull().default(false),
        image: text('image'),

        // Custom fields for admin dashboard
        role: varchar('role', { length: 50 }).notNull().default('viewer'),

        // Admin plugin fields for banning users
        banned: boolean('banned').default(false),
        banReason: text('ban_reason'),
        banExpires: timestamp('ban_expires'),

        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at')
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
    },
    (table) => [
        {
            emailIdx: index('user_email_idx').on(table.email),
            roleIdx: index('user_role_idx').on(table.role),
        },
    ]
)

export type User = typeof user.$inferSelect
export type InsertUser = typeof user.$inferInsert

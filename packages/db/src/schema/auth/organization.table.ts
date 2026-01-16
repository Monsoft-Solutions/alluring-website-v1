import { index, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'

/**
 * Organization table for Better-Auth
 * Stores organization (single org for this admin dashboard)
 */
export const organization = pgTable(
    'organization',
    {
        id: text('id').primaryKey(),
        name: varchar('name', { length: 255 }).notNull(),
        slug: varchar('slug', { length: 255 }).notNull().unique(),
        logo: text('logo'),
        metadata: text('metadata'),
        createdAt: timestamp('created_at').notNull().defaultNow(),
    },
    (table) => [
        {
            slugIdx: index('organization_slug_idx').on(table.slug),
        },
    ]
)

export type Organization = typeof organization.$inferSelect
export type InsertOrganization = typeof organization.$inferInsert

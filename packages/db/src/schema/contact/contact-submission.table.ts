import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const contactSubmission = pgTable('contact_submission', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    firstName: text('first_name'),
    lastName: text('last_name'),
    email: text('email').notNull(),
    phone: text('phone'),
    subject: text('subject'),
    message: text('message'),
    procedure: text('procedure'),
    preferredContactTime: text('preferred_contact_time'),
    consentGiven: boolean('consent_given').default(false),
    source: text('source'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
})

export type ContactSubmission = typeof contactSubmission.$inferSelect
export type InsertContactSubmission = typeof contactSubmission.$inferInsert

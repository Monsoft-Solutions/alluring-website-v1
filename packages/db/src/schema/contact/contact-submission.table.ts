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

    // Analytics tracking fields
    ipAddress: text('ip_address'),
    utmSource: text('utm_source'),
    utmMedium: text('utm_medium'),
    utmCampaign: text('utm_campaign'),
    utmContent: text('utm_content'),
    utmTerm: text('utm_term'),
    gclid: text('gclid'),
    fbclid: text('fbclid'),
    ttclid: text('ttclid'),
    referrer: text('referrer'),
    landingPage: text('landing_page'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
})

export type ContactSubmission = typeof contactSubmission.$inferSelect
export type InsertContactSubmission = typeof contactSubmission.$inferInsert

import {
    boolean,
    index,
    pgTable,
    text,
    timestamp,
    uuid,
} from 'drizzle-orm/pg-core'

export const contactSubmission = pgTable(
    'contact_submission',
    {
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
        // Google Ads sends these instead of, or beside, gclid on iOS traffic.
        gbraid: text('gbraid'),
        wbraid: text('wbraid'),
        // `gad_campaignid`: the campaign id, since the tracking template's
        // `{campaignname}` never expands and leaves utm_campaign empty.
        gadCampaignId: text('gad_campaign_id'),
        fbclid: text('fbclid'),
        ttclid: text('ttclid'),
        // Meta pixel cookies, the match keys a Conversions API event needs.
        fbp: text('fbp'),
        fbc: text('fbc'),
        referrer: text('referrer'),
        landingPage: text('landing_page'),
        // Where the form itself was submitted — `landing_page` is where the
        // session started, and several pages share one source.
        submittedFromPath: text('submitted_from_path'),
        // GA4 client id from the `_ga` cookie: joins a lead to its GA4
        // behaviour without sending anything about the lead to Google.
        gaClientId: text('ga_client_id'),

        // The consultation thread's answers and the context it was sent in
        // (#274), stored as their option values — labels are copy and change.
        timeline: text('timeline'),
        // 'en' | 'es' — the language the visitor used the page in.
        language: text('language'),
        // The promotion shown next to the form, by title.
        offer: text('offer'),
        // IANA zone from the visitor's browser, e.g. 'America/Chicago'.
        timeZone: text('time_zone'),

        // Optional answers from the thank-you page, added to the same lead.
        consultType: text('consult_type'),
        financingInterest: text('financing_interest'),
        heardFrom: text('heard_from'),

        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at')
            .defaultNow()
            .notNull()
            .$onUpdate(() => new Date()),
    },
    (table) => [
        // Performance Indexes
        index('contact_submission_created_at_idx').on(table.createdAt),
    ]
)

export type ContactSubmission = typeof contactSubmission.$inferSelect
export type InsertContactSubmission = typeof contactSubmission.$inferInsert

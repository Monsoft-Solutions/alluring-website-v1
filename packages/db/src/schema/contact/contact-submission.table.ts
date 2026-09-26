import {
    boolean,
    index,
    jsonb,
    pgTable,
    text,
    timestamp,
    uuid,
} from 'drizzle-orm/pg-core'

import type { LandingParams } from '@workspace/shared/attribution'

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
        // ValueTrack parameters from the landing URL with unexpanded `{…}`
        // tokens dropped — keyword, matchtype, network, device, gad_source,
        // utm_id. Before this they only survived inside `landing_page`.
        landingParams: jsonb('landing_params').$type<LandingParams>(),
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

        // Which version of the page and which form sent the lead, for pages
        // under an A/B test (the ads landing page, #292): 'ads-consultation-v6'
        // and 'thread' | 'card'. Null for every other form.
        pageVariant: text('page_variant'),
        formVariant: text('form_variant'),
        // How the visitor agreed to be texted: 'checkbox' (the site-wide
        // wording) or 'tap' (a line above the button that names it), and
        // which wording, e.g. 'lp-tap-2026-09-26'. Null for older leads and
        // forms that don't say.
        consentMethod: text('consent_method'),
        consentVersion: text('consent_version'),

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

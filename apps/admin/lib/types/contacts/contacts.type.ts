import type { LeadAttribution } from '@/lib/types/analytics/lead-trends.type'

export type ContactListItem = {
    id: string
    name: string
    firstName: string | null
    lastName: string | null
    email: string
    phone: string | null
    subject: string | null
    procedure: string | null
    message: string | null
    source: string | null
    preferredContactTime: string | null
    utmSource: string | null
    utmMedium: string | null
    utmCampaign: string | null
    utmContent: string | null
    utmTerm: string | null
    gclid: string | null
    fbclid: string | null
    ttclid: string | null
    referrer: string | null
    landingPage: string | null
    ipAddress: string | null
    createdAt: Date
}

/**
 * A ContactListItem with its derived attribution (canonical source/medium
 * produced by `classifyLeadAttribution`). The attribution is nested to avoid
 * shadowing the raw `source` column preserved on `ContactListItem`.
 */
export type ClassifiedContactListItem = ContactListItem & {
    attribution: LeadAttribution
}

export type ContactAnalyticsStats = {
    totalContacts: number
    bySource: { source: string; count: number }[]
    byUtmSource: { utmSource: string; count: number }[]
    byProcedure: { procedure: string; count: number }[]
}

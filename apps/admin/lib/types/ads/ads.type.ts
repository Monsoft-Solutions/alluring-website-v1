/**
 * Ads console types (epic #288), shared by the queries, the API routes and
 * the client hooks.
 *
 * Dates are account-zone calendar days (YYYY-MM-DD). Times are naive
 * wall-clock ISO strings (`2026-09-24T06:31:00`) in Miami time — the way the
 * database stores them — so the page shows the same clock everywhere.
 *
 * "Google conv." fields are Google's Conversions column; "leads" are paid
 * Google leads in the website database (`lead_ad_click`). They are kept apart
 * on purpose: the gap between them is the tracking-health signal.
 */
import type { LeadAdMatch } from '@workspace/db/schema/ads'

import type { AttentionItem } from '@/lib/utils/ads/ads-attention.util'
import type { TermClassName } from '@/lib/utils/ads/term-class.util'

export type { AttentionItem, LeadAdMatch, TermClassName }

/** An inclusive account-zone window. */
export type AdsRange = {
    from: string
    to: string
}

/** Every Ads endpoint answers `{ configured, data }`, like Search Console's. */
export type AdsResponse<T> =
    | { configured: false; data: null }
    | { configured: true; data: T }

// ============================================
// Sync status
// ============================================

export type AdsRunSummary = {
    status: 'running' | 'completed' | 'failed'
    trigger: 'cron' | 'manual' | 'backfill'
    startedAt: string
    finishedAt: string | null
    apiOperations: number | null
    counts: Record<string, number> | null
    error: string | null
}

export type AdsSyncStatus = {
    snapshot: AdsRunSummary | null
    leadClicks: AdsRunSummary | null
    /** Oldest and newest day in the snapshot. */
    earliestDate: string | null
    latestDate: string | null
    /** Operations spent today by both jobs (Explorer allows 2,880 a day). */
    operationsToday: number
}

// ============================================
// Overview + campaigns
// ============================================

export type AdsDeliveryTotals = {
    impressions: number
    clicks: number
    cost: number
    /** Average cost per click. */
    cpc: number | null
    /** Google's Conversions column. */
    googleConversions: number
}

export type AdsKpis = AdsDeliveryTotals & {
    leads: number
    /** Leads whose gclid matched a click. */
    clickMatchedLeads: number
    costPerLead: number | null
    /** Google conversions from primary non-call actions vs calls. */
    formConversions: number
    callConversions: number
    /** Cost per lead over the 90 days before the window; null without data. */
    baselineCostPerLead: number | null
}

export type AdsCampaignRow = AdsDeliveryTotals & {
    campaignId: string
    campaignName: string
    status: string | null
    channel: string | null
    biddingStrategy: string | null
    dailyBudget: number | null
    leads: number
    costPerLead: number | null
}

export type AdsDailyPoint = {
    date: string
    cost: number
    clicks: number
    leads: number
    googleConversions: number
    /** Combined daily budgets of the campaigns that delivered. */
    budget: number | null
    /** Account changes made that day. */
    changes: number
}

export type AdsChangeMarker = {
    date: string
    count: number
    /** "angela@… paused 4 campaigns" style one-liner. */
    summary: string
}

export type AdsOverview = {
    range: AdsRange
    kpis: AdsKpis
    daily: AdsDailyPoint[]
    campaigns: AdsCampaignRow[]
    /** Paid leads with no campaign at all (tagged only). */
    unassignedLeads: number
    attention: AttentionItem[]
    changeMarkers: AdsChangeMarker[]
}

export type AdsLeadMixEntry = { value: string; leads: number }

export type AdsCampaignDetail = {
    range: AdsRange
    campaign: AdsCampaignRow
    daily: AdsDailyPoint[]
    /** What the campaign's leads asked for — its lead quality. */
    leadMix: {
        procedure: AdsLeadMixEntry[]
        timeline: AdsLeadMixEntry[]
        financingInterest: AdsLeadMixEntry[]
    }
}

// ============================================
// Keywords, search terms, landing pages
// ============================================

export type AdsKeywordRow = AdsDeliveryTotals & {
    campaignId: string
    campaignName: string
    adGroupId: string
    adGroupName: string
    keyword: string
    matchType: string
    status: string
    qualityScore: number | null
    leads: number
    costPerLead: number | null
}

export type AdsKeywordsReport = {
    range: AdsRange
    keywords: AdsKeywordRow[]
    totals: {
        cost: number
        leadsViaKeyword: number
        /** Click-matched leads with no keyword (Performance Max, Display). */
        leadsWithoutKeyword: number
        costWithNoLead: number
    }
}

export type AdsSearchTermRow = AdsDeliveryTotals & {
    searchTerm: string
    campaignId: string
    campaignName: string
    /** ADDED / EXCLUDED / NONE, as of the latest day it appeared. */
    status: string
    matchTypes: string[]
    termClass: TermClassName
}

export type AdsSearchTermsReport = {
    range: AdsRange
    terms: AdsSearchTermRow[]
    totals: {
        cost: number
        costWithNoConversion: number
        byClass: Record<TermClassName, { cost: number; terms: number }>
    }
    /**
     * Every competitor term that cost money and isn't a negative yet, costliest
     * first — the "copy as negatives" list, beyond the rows the table shows.
     */
    competitorNegatives: string[]
}

export type AdsLandingPageRow = AdsDeliveryTotals & {
    page: string
    path: string
    urlVariants: number
    sampleUrl: string
    leads: number
    costPerLead: number | null
}

export type AdsLandingPagesReport = {
    range: AdsRange
    expanded: boolean
    pages: AdsLandingPageRow[]
}

export type AdsTermClassEntry = {
    id: string
    pattern: string
    termClass: TermClassName
}

// ============================================
// Leads
// ============================================

export type AdsLeadRow = {
    leadId: string
    name: string
    /** Naive Miami wall time. */
    createdAt: string
    leadDate: string
    form: string | null
    procedure: string | null
    match: LeadAdMatch
    pending: boolean
    clickIdType: string | null
    clickIdSource: string | null
    clickDate: string | null
    campaignId: string | null
    campaignName: string | null
    adGroupName: string | null
    keyword: string | null
    keywordMatchType: string | null
    device: string | null
    network: string | null
    landingPath: string | null
}

export type AdsLeadsReport = {
    range: AdsRange
    leads: AdsLeadRow[]
    coverage: Record<LeadAdMatch, number>
    total: number
}

/** The "Ad click" card on a contact page. */
export type ContactAdClick = Omit<AdsLeadRow, 'name' | 'form' | 'procedure'> & {
    resolvedAt: string | null
    attempts: number
}

// ============================================
// Changes + tracking
// ============================================

export type AdsChangeEventRow = {
    resourceName: string
    changedAt: string
    date: string
    userEmail: string
    clientType: string
    resourceType: string
    operation: string
    changedFields: string[]
    campaignName: string | null
    adGroupName: string | null
    values: Record<string, { old: unknown; new: unknown }> | null
}

export type AdsChangesReport = {
    range: AdsRange
    events: AdsChangeEventRow[]
    users: string[]
    /** Change log coverage: the oldest event stored. */
    oldestStored: string | null
}

export type AdsConversionActionRow = {
    conversionActionId: string
    actionName: string
    category: string
    origin: string
    primaryForGoal: boolean
    isCall: boolean
    /** Conversions column (what bidding learns from). */
    counted: number
    /** All conversions. */
    recorded: number
}

export type AdsTrackingDay = {
    date: string
    formConversions: number
    callConversions: number
    paidLeads: number
}

export type AdsTrackingReport = {
    range: AdsRange
    actions: AdsConversionActionRow[]
    days: AdsTrackingDay[]
    paidLeads: number
    alerts: AttentionItem[]
}

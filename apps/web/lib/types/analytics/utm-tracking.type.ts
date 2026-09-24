/**
 * UTM Tracking Type Definitions
 *
 * Types for capturing and persisting UTM parameters and ad platform click IDs
 * across page navigation for attribution tracking.
 *
 * @module types/analytics/utm-tracking
 */

/**
 * Standard UTM parameters for campaign tracking
 */
export type UTMParams = {
    /** Traffic source (e.g., 'google', 'facebook', 'influencer') */
    readonly utmSource?: string
    /** Marketing medium (e.g., 'cpc', 'social', 'email') */
    readonly utmMedium?: string
    /** Campaign name identifier */
    readonly utmCampaign?: string
    /** Specific content or ad variation */
    readonly utmContent?: string
    /** Search keywords (for paid search) */
    readonly utmTerm?: string
}

/**
 * Ad platform click identifiers
 */
export type ClickIds = {
    /** Google Click ID - automatically appended by Google Ads */
    readonly gclid?: string
    /** Google Ads click ID for app-to-web (iOS) traffic, sent instead of or beside gclid */
    readonly gbraid?: string
    /** Google Ads click ID for web-to-app (iOS) traffic */
    readonly wbraid?: string
    /** Google Ads campaign id, auto-appended with auto-tagging (`gad_campaignid`) */
    readonly gadCampaignId?: string
    /** Facebook Click ID - automatically appended by Meta Ads */
    readonly fbclid?: string
    /** TikTok Click ID - automatically appended by TikTok Ads */
    readonly ttclid?: string
}

/**
 * Session context data captured on landing
 */
export type SessionContext = {
    /** HTTP referrer from where the user came */
    readonly referrer?: string
    /** First page URL the user landed on */
    readonly landingPage?: string
}

/**
 * Complete UTM tracking data for form submissions
 */
export type UTMData = UTMParams & ClickIds & SessionContext

/**
 * URL parameter names to extract for UTM tracking
 */
export const UTM_PARAM_NAMES = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
    'gclid',
    'gbraid',
    'wbraid',
    'gad_campaignid',
    'fbclid',
    'ttclid',
] as const

export type UTMParamName = (typeof UTM_PARAM_NAMES)[number]

/**
 * localStorage key for persisting UTM data
 */
export const UTM_STORAGE_KEY = 'alluring_utm_data'

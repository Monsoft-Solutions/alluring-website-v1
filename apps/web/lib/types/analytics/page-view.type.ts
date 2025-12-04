/**
 * Page View Analytics Type Definitions
 *
 * Types for cookie-free page view tracking.
 * Used by the client-side tracker and server-side API.
 *
 * @module types/analytics/page-view
 */

/**
 * Device type classification
 */
export type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'unknown'

/**
 * Data sent from client to track a page view
 */
export type PageViewPayload = {
    /** Current page path (e.g., '/about', '/blog/post-slug') */
    readonly pagePath: string
    /** Full page URL including query params */
    readonly pageUrl: string
    /** Document title */
    readonly pageTitle?: string
    /** HTTP referrer */
    readonly referrer?: string
    /** Session ID (generated client-side, stored in sessionStorage) */
    readonly sessionId?: string

    // UTM parameters
    readonly utmSource?: string
    readonly utmMedium?: string
    readonly utmCampaign?: string
    readonly utmContent?: string
    readonly utmTerm?: string
}

/**
 * Parsed user agent information
 */
export type ParsedUserAgent = {
    readonly browser: string
    readonly browserVersion: string
    readonly os: string
    readonly osVersion: string
    readonly deviceType: DeviceType
}

/**
 * Geo information extracted from request headers
 */
export type GeoInfo = {
    readonly countryCode?: string
    readonly region?: string
    readonly city?: string
}

/**
 * Complete page view data for database insertion
 */
export type PageViewData = PageViewPayload & {
    readonly userAgent?: string
    readonly browser?: string
    readonly browserVersion?: string
    readonly os?: string
    readonly osVersion?: string
    readonly deviceType?: DeviceType
    readonly countryCode?: string
    readonly region?: string
    readonly city?: string
}

/**
 * API response for page view tracking
 */
export type PageViewResponse = {
    readonly success: boolean
    readonly message?: string
}

/**
 * Session storage key for session ID
 */
export const SESSION_ID_KEY = 'alluring_session_id'

/**
 * API endpoint path for page view tracking
 */
export const PAGE_VIEW_API_PATH = '/api/analytics/page-view'

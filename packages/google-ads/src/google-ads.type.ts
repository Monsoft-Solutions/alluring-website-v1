/**
 * Google Ads data-layer types
 *
 * @module @workspace/google-ads — types
 */

/** Resolved connection settings for one Google Ads account. */
export type GoogleAdsConfig = {
    /** Service account email (shared with Search Console and GA4). */
    clientEmail: string
    /** Service account private key, newlines already unescaped. */
    privateKey: string
    /** Account queried by default — digits only, no dashes. */
    customerId: string
    /** Manager account to authenticate through, when access comes via an MCC. */
    loginCustomerId?: string
    /** REST API version path segment, e.g. `v25`. */
    apiVersion: string
    /** IANA zone the account reports in; GAQL dates are in this zone. */
    timeZone: string
}

/** An inclusive date window in the account's time zone (YYYY-MM-DD). */
export type DateRange = {
    startDate: string
    endDate: string
    days: number
}

/**
 * One GAQL result row, flattened to GAQL field names — `campaign.name`,
 * `metrics.clicks`. Money fields drop their `_micros` suffix and arrive in
 * account currency (`metrics.cost`), and metrics are numbers.
 */
export type FlatRow = Record<string, string | number | boolean | null>

/** A raw row as the REST API returns it: nested, camelCased, int64 as strings. */
export type RawRow = Record<string, unknown>

/** Result of a GAQL search, after pagination. */
export type GaqlSearchResult = {
    rows: FlatRow[]
    /** Whether `maxRows` cut the result short. */
    truncated: boolean
}

/** Options shared by every GAQL call. */
export type GaqlSearchOptions = {
    /** Override the configured account. */
    customerId?: string
    /** Stop paginating after this many rows. */
    maxRows?: number
}

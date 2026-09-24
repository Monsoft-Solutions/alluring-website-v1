/**
 * Google Ads configuration
 *
 * Authentication reuses the Search Console service account. Google sunset
 * developer tokens on 2026-09-09: API access now follows the Cloud project that
 * owns the credentials, so no developer-token header is sent.
 *
 * @module @workspace/google-ads — config
 */
import { readGoogleAdsEnv } from './env.js'
import type { GoogleAdsConfig } from './google-ads.type.js'

/** REST version the queries in this package were verified against. */
export const DEFAULT_API_VERSION = 'v25'

/** Zone the Alluring account reports in, used when none is configured. */
export const DEFAULT_TIME_ZONE = 'America/New_York'

/** Strip the dashes Google Ads shows in customer ids (447-254-7809). */
export function normalizeCustomerId(value: string): string {
    return value.replace(/-/g, '').trim()
}

/** Whether credentials and an account id are present. */
export function isGoogleAdsConfigured(): boolean {
    const env = readGoogleAdsEnv()
    return Boolean(
        env.GOOGLE_CLIENT_EMAIL &&
            env.GOOGLE_PRIVATE_KEY &&
            env.GOOGLE_ADS_CUSTOMER_ID
    )
}

/**
 * Resolve the configuration, throwing a message that names the missing
 * variables when anything required is absent.
 */
export function getGoogleAdsConfig(): GoogleAdsConfig {
    const env = readGoogleAdsEnv()
    const clientEmail = env.GOOGLE_CLIENT_EMAIL
    const privateKey = env.GOOGLE_PRIVATE_KEY
    const customerId = env.GOOGLE_ADS_CUSTOMER_ID

    if (!clientEmail || !privateKey || !customerId) {
        const missing = [
            !clientEmail && 'GOOGLE_CLIENT_EMAIL',
            !privateKey && 'GOOGLE_PRIVATE_KEY',
            !customerId && 'GOOGLE_ADS_CUSTOMER_ID',
        ].filter(Boolean)
        throw new Error(
            `Google Ads is not configured: missing ${missing.join(', ')}`
        )
    }

    const loginCustomerId = env.GOOGLE_ADS_LOGIN_CUSTOMER_ID

    return {
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
        customerId: normalizeCustomerId(customerId),
        loginCustomerId: loginCustomerId
            ? normalizeCustomerId(loginCustomerId)
            : undefined,
        apiVersion: env.GOOGLE_ADS_API_VERSION ?? DEFAULT_API_VERSION,
        timeZone: env.GOOGLE_ADS_TIME_ZONE ?? DEFAULT_TIME_ZONE,
    }
}

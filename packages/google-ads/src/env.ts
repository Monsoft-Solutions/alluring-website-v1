/**
 * Environment access for the Google Ads data layer
 *
 * Parsed on every call instead of snapshotted at import (as createEnv would),
 * so a standalone consumer — the MCP server — can load its .env files at any
 * point before the first request, and tests can stub variables per case.
 *
 * @module @workspace/google-ads — env
 */
import { z } from 'zod'

const envSchema = z.object({
    /** Service account shared with Search Console and GA4. */
    GOOGLE_CLIENT_EMAIL: z.string().optional(),
    GOOGLE_PRIVATE_KEY: z.string().optional(),
    /** Account to query, e.g. 447-254-7809 (dashes allowed). */
    GOOGLE_ADS_CUSTOMER_ID: z.string().optional(),
    /** Manager account id, only when access is granted through an MCC. */
    GOOGLE_ADS_LOGIN_CUSTOMER_ID: z.string().optional(),
    /** REST version override, e.g. v26 once it ships. */
    GOOGLE_ADS_API_VERSION: z.string().optional(),
    /** IANA zone the account reports in. */
    GOOGLE_ADS_TIME_ZONE: z.string().optional(),
})

export type GoogleAdsEnv = z.infer<typeof envSchema>

/** Read the Google Ads variables from process.env, as they are right now. */
export function readGoogleAdsEnv(): GoogleAdsEnv {
    return envSchema.parse({
        GOOGLE_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL || undefined,
        GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY || undefined,
        GOOGLE_ADS_CUSTOMER_ID: process.env.GOOGLE_ADS_CUSTOMER_ID || undefined,
        GOOGLE_ADS_LOGIN_CUSTOMER_ID:
            process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || undefined,
        GOOGLE_ADS_API_VERSION: process.env.GOOGLE_ADS_API_VERSION || undefined,
        GOOGLE_ADS_TIME_ZONE: process.env.GOOGLE_ADS_TIME_ZONE || undefined,
    })
}

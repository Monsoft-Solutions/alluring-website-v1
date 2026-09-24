/**
 * Shared plumbing for the `/api/admin/ads/*` routes: auth, the
 * `{ configured, data }` envelope (as the Search Console routes answer),
 * the date window, and error handling — so each route is its query.
 *
 * @module @/lib/utils/ads/ads-route.util
 */
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { leadAdMatch, type LeadAdMatch } from '@workspace/db/schema/ads'
import {
    addDays,
    daysBetween,
    getGoogleAdsConfig,
    isGoogleAdsConfigured,
    todayIn,
} from '@workspace/google-ads'

import type { AdsRange } from '@/lib/types/ads/ads.type'
import { handleApiError } from '@/lib/utils/api-error-handler.util'
import { requireAuth } from '@/lib/utils/auth.util'

/** Longest window a page may ask for — the backfill keeps 13 months. */
export const MAX_RANGE_DAYS = 400

/** Window when the page asks for none. */
export const DEFAULT_RANGE_DAYS = 28

/** A real calendar day: `2026-02-30` round-trips to March, so it fails. */
const isoDate = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD')
    .refine(
        (value) => {
            const parsed = new Date(`${value}T12:00:00Z`)
            return (
                !Number.isNaN(parsed.getTime()) &&
                parsed.toISOString().slice(0, 10) === value
            )
        },
        { message: 'Not a real date' }
    )

const rangeSchema = z.object({
    from: isoDate.optional(),
    to: isoDate.optional(),
})

/** The last DEFAULT_RANGE_DAYS through today, in the account zone. */
export function defaultAdsRange(now: Date = new Date()): AdsRange {
    const to = todayIn(getGoogleAdsConfig().timeZone, now)
    return { from: addDays(to, -(DEFAULT_RANGE_DAYS - 1)), to }
}

/**
 * Parse `from` / `to` from the query string, defaulting either missing end.
 *
 * @returns The range, or a 400 response
 */
export function parseAdsRange(
    searchParams: URLSearchParams
): { range: AdsRange } | { error: NextResponse } {
    const parsed = rangeSchema.safeParse({
        from: searchParams.get('from') ?? undefined,
        to: searchParams.get('to') ?? undefined,
    })
    if (!parsed.success) {
        return {
            error: NextResponse.json(
                {
                    success: false,
                    error: 'Invalid query parameters',
                    details: parsed.error.issues,
                },
                { status: 400 }
            ),
        }
    }
    const fallback = defaultAdsRange()
    const to = parsed.data.to ?? fallback.to
    const from = parsed.data.from ?? addDays(to, -(DEFAULT_RANGE_DAYS - 1))

    // Checked after defaulting, so `?from=1900-01-01` alone is caught too.
    const problem =
        from > to
            ? 'from must be on or before to'
            : daysBetween(from, to) > MAX_RANGE_DAYS
              ? `Range may not exceed ${MAX_RANGE_DAYS} days`
              : null
    if (problem) {
        return {
            error: NextResponse.json(
                {
                    success: false,
                    error: 'Invalid query parameters',
                    details: problem,
                },
                { status: 400 }
            ),
        }
    }
    return { range: { from, to } }
}

/**
 * Run an Ads GET route: authenticate, answer `{ configured: false }` when the
 * account isn't set up, parse the window, and wrap the result.
 *
 * @param label - Used in the error message and log line
 * @param handler - Builds the data from the window and the query string
 */
export async function adsGetRoute<T>(
    request: NextRequest,
    label: string,
    handler: (range: AdsRange, searchParams: URLSearchParams) => Promise<T>
): Promise<NextResponse> {
    try {
        await requireAuth()

        if (!isGoogleAdsConfigured()) {
            return NextResponse.json({ configured: false, data: null })
        }

        const searchParams = request.nextUrl.searchParams
        const parsed = parseAdsRange(searchParams)
        if ('error' in parsed) return parsed.error

        const data = await handler(parsed.range, searchParams)
        return NextResponse.json({ configured: true, data })
    } catch (error) {
        return handleApiError(
            error,
            `Failed to load ${label}`,
            `Error loading ${label}:`
        )
    }
}

/** An optional numeric id from the query string (campaign ids are digits). */
export function numericParam(
    searchParams: URLSearchParams,
    name: string
): string | undefined {
    const value = searchParams.get(name)?.trim()
    return value && /^\d+$/.test(value) ? value : undefined
}

/** A `match` query value, when it names a real ladder rung. */
export function parseMatch(value: string | null): LeadAdMatch | undefined {
    return leadAdMatch.enumValues.find((match) => match === value)
}

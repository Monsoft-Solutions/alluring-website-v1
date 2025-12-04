/**
 * Promotion View Tracking API Handler
 *
 * Increments the view count for a specific promotion.
 * Protected against bots via User-Agent filtering and rate-limited per IP.
 *
 * @module app/api/promotions/[id]/views/route
 */
import { type NextRequest, NextResponse } from 'next/server'

import { db } from '@workspace/db/client'
import { promotion } from '@workspace/db/schema/promotion'
import { eq, sql } from 'drizzle-orm'

type RouteParams = {
    params: Promise<{ id: string }>
}

type ViewTrackResponse = {
    success: boolean
    message?: string
}

/**
 * Known bot/crawler User-Agent patterns
 * These patterns match common bots, crawlers, and automated tools
 */
const BOT_PATTERNS = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /crawling/i,
    /slurp/i,
    /mediapartners/i,
    /googlebot/i,
    /bingbot/i,
    /yandex/i,
    /baiduspider/i,
    /facebookexternalhit/i,
    /twitterbot/i,
    /rogerbot/i,
    /linkedinbot/i,
    /embedly/i,
    /quora link preview/i,
    /showyoubot/i,
    /outbrain/i,
    /pinterest/i,
    /developers\.google\.com/i,
    /slackbot/i,
    /vkshare/i,
    /w3c_validator/i,
    /redditbot/i,
    /applebot/i,
    /whatsapp/i,
    /flipboard/i,
    /tumblr/i,
    /bitlybot/i,
    /skypeuripreview/i,
    /nuzzel/i,
    /discordbot/i,
    /google page speed/i,
    /qwantify/i,
    /pinterestbot/i,
    /bitrix link preview/i,
    /xing-contenttabreceiver/i,
    /chrome-lighthouse/i,
    /telegrambot/i,
    /integration\s?test/i,
    /headless/i,
    /phantomjs/i,
    /slimerjs/i,
    /selenium/i,
    /webdriver/i,
    /puppeteer/i,
    /playwright/i,
    /prerender/i,
    /curl/i,
    /wget/i,
    /httpie/i,
    /python-requests/i,
    /axios/i,
    /node-fetch/i,
    /go-http-client/i,
    /java/i,
    /ahrefs/i,
    /semrush/i,
    /dotbot/i,
    /mj12bot/i,
    /screaming frog/i,
]

/**
 * In-memory rate limiting store
 * Key: IP address, Value: { count, windowStart }
 * Note: For production with multiple instances, use Redis instead
 */
const rateLimitStore = new Map<string, { count: number; windowStart: number }>()

/** Rate limit configuration */
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute window
const RATE_LIMIT_MAX_REQUESTS = 10 // Max 10 view increments per minute per IP

/** Cleanup interval to prevent memory leaks */
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000 // Every 5 minutes

// Periodic cleanup of expired rate limit entries
let lastCleanup = Date.now()

function cleanupRateLimitStore(): void {
    const now = Date.now()
    if (now - lastCleanup < CLEANUP_INTERVAL_MS) return

    lastCleanup = now
    const expiredThreshold = now - RATE_LIMIT_WINDOW_MS

    for (const [key, value] of rateLimitStore.entries()) {
        if (value.windowStart < expiredThreshold) {
            rateLimitStore.delete(key)
        }
    }
}

/**
 * Check if User-Agent matches known bot patterns
 */
function isBot(userAgent: string | null): boolean {
    if (!userAgent) return true // No UA is suspicious
    return BOT_PATTERNS.some((pattern) => pattern.test(userAgent))
}

/**
 * Check if IP is rate limited
 * Returns true if request should be blocked
 */
function isRateLimited(ip: string): boolean {
    cleanupRateLimitStore()

    const now = Date.now()
    const entry = rateLimitStore.get(ip)

    if (!entry) {
        // First request from this IP
        rateLimitStore.set(ip, { count: 1, windowStart: now })
        return false
    }

    // Check if window has expired
    if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
        // Reset window
        rateLimitStore.set(ip, { count: 1, windowStart: now })
        return false
    }

    // Increment count and check limit
    entry.count++
    return entry.count > RATE_LIMIT_MAX_REQUESTS
}

/**
 * Get client IP from request headers
 */
function getClientIp(request: NextRequest): string {
    // Check common proxy headers
    const forwardedFor = request.headers.get('x-forwarded-for')
    if (forwardedFor) {
        // Take the first IP in the chain (client IP)
        return forwardedFor.split(',')[0].trim()
    }

    const realIp = request.headers.get('x-real-ip')
    if (realIp) {
        return realIp.trim()
    }

    // Fallback - use a hash of some request characteristics
    return 'unknown'
}

/**
 * Validate UUID format
 */
function isValidUUID(id: string): boolean {
    const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(id)
}

/**
 * POST handler for promotion view tracking
 *
 * Atomically increments the view count for a promotion.
 * Protected against bots via User-Agent filtering and rate-limited per IP.
 *
 * @param request - Next.js request object
 * @param params - Route params containing promotion ID
 * @returns JSON response indicating tracking status
 */
export async function POST(
    request: NextRequest,
    { params }: RouteParams
): Promise<NextResponse<ViewTrackResponse>> {
    try {
        const { id } = await params

        // Validate promotion ID format
        if (!id || !isValidUUID(id)) {
            return NextResponse.json(
                { success: false, message: 'Invalid promotion ID' },
                { status: 400 }
            )
        }

        // Check User-Agent for bots
        const userAgent = request.headers.get('user-agent')
        if (isBot(userAgent)) {
            // Return success but don't increment - don't reveal bot detection
            return NextResponse.json({ success: true }, { status: 200 })
        }

        // Check rate limit
        const clientIp = getClientIp(request)
        if (isRateLimited(clientIp)) {
            // Return success but don't increment - silently ignore over-limit requests
            return NextResponse.json({ success: true }, { status: 200 })
        }

        // Increment views asynchronously - don't await to return quickly
        Promise.resolve().then(async () => {
            try {
                await db
                    .update(promotion)
                    .set({
                        views: sql`${promotion.views} + 1`,
                    })
                    .where(eq(promotion.id, id))
            } catch (error) {
                // Log but don't fail - view tracking should never break the user experience
                console.error(
                    '[Promotion] Failed to increment promotion views:',
                    error
                )
            }
        })

        // Return immediately
        return NextResponse.json({ success: true }, { status: 200 })
    } catch (error) {
        console.error('[Promotion] View tracking API error:', error)
        return NextResponse.json(
            { success: false, message: 'Internal error' },
            { status: 500 }
        )
    }
}

/**
 * OPTIONS handler for CORS preflight requests
 */
export async function OPTIONS(): Promise<NextResponse> {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400',
        },
    })
}

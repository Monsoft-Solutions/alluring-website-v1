/**
 * Page View Analytics API Handler
 *
 * Cookie-free page view tracking endpoint. Records page views with:
 * - Page path, URL, title
 * - Referrer and UTM parameters
 * - Device/browser information (parsed from user agent)
 * - Geo information (from Vercel/Cloudflare headers - IP is NOT stored)
 * - Session ID (client-generated, stored in sessionStorage)
 *
 * @module app/api/analytics/page-view/route
 */
import { type NextRequest, NextResponse } from 'next/server'

import { db } from '@workspace/db/client'
import { pageView, type InsertPageView } from '@workspace/db/schema/analytics'

import {
    type DeviceType,
    type GeoInfo,
    type PageViewPayload,
    type PageViewResponse,
    type ParsedUserAgent,
} from '@/lib/types/analytics/page-view.type'

/**
 * Parse user agent string to extract browser, OS, and device info
 * Uses simple regex-based parsing (no external dependencies)
 */
function parseUserAgent(ua?: string | null): ParsedUserAgent {
    if (!ua) {
        return {
            browser: 'Unknown',
            browserVersion: '',
            os: 'Unknown',
            osVersion: '',
            deviceType: 'unknown',
        }
    }

    // Device type detection
    let deviceType: DeviceType = 'desktop'
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
        deviceType = 'tablet'
    } else if (
        /mobile|iphone|ipod|android.*mobile|windows.*phone|webos|blackberry|opera mini|opera mobi/i.test(
            ua
        )
    ) {
        deviceType = 'mobile'
    }

    // Browser detection
    let browser = 'Unknown'
    let browserVersion = ''

    if (/edg/i.test(ua)) {
        browser = 'Edge'
        browserVersion = ua.match(/edg\/(\d+(\.\d+)?)/i)?.[1] ?? ''
    } else if (/chrome|crios/i.test(ua) && !/chromium/i.test(ua)) {
        browser = 'Chrome'
        browserVersion = ua.match(/(?:chrome|crios)\/(\d+(\.\d+)?)/i)?.[1] ?? ''
    } else if (/firefox|fxios/i.test(ua)) {
        browser = 'Firefox'
        browserVersion =
            ua.match(/(?:firefox|fxios)\/(\d+(\.\d+)?)/i)?.[1] ?? ''
    } else if (/safari/i.test(ua) && !/chrome|chromium|crios/i.test(ua)) {
        browser = 'Safari'
        browserVersion = ua.match(/version\/(\d+(\.\d+)?)/i)?.[1] ?? ''
    } else if (/opr|opera/i.test(ua)) {
        browser = 'Opera'
        browserVersion = ua.match(/(?:opr|opera)\/(\d+(\.\d+)?)/i)?.[1] ?? ''
    }

    // OS detection
    let os = 'Unknown'
    let osVersion = ''

    if (/windows nt/i.test(ua)) {
        os = 'Windows'
        const ntVersion = ua.match(/windows nt (\d+\.\d+)/i)?.[1]
        // Map NT version to Windows version
        const windowsVersionMap: Record<string, string> = {
            '10.0': '10/11',
            '6.3': '8.1',
            '6.2': '8',
            '6.1': '7',
            '6.0': 'Vista',
        }
        osVersion = ntVersion ? (windowsVersionMap[ntVersion] ?? ntVersion) : ''
    } else if (/macintosh|mac os x/i.test(ua)) {
        os = 'macOS'
        osVersion =
            ua
                .match(/mac os x (\d+[._]\d+([._]\d+)?)/i)?.[1]
                ?.replace(/_/g, '.') ?? ''
    } else if (/iphone|ipad|ipod/i.test(ua)) {
        os = 'iOS'
        osVersion =
            ua.match(/os (\d+[._]\d+([._]\d+)?)/i)?.[1]?.replace(/_/g, '.') ??
            ''
    } else if (/android/i.test(ua)) {
        os = 'Android'
        osVersion = ua.match(/android (\d+(\.\d+)?)/i)?.[1] ?? ''
    } else if (/linux/i.test(ua)) {
        os = 'Linux'
    }

    return {
        browser,
        browserVersion,
        os,
        osVersion,
        deviceType,
    }
}

/**
 * Extract geo information from request headers
 * Uses Vercel or Cloudflare geo headers (IP is NOT stored)
 */
function extractGeoInfo(request: NextRequest): GeoInfo {
    // Vercel headers (automatically set when deployed to Vercel)
    const vercelCountry = request.headers.get('x-vercel-ip-country')
    const vercelRegion = request.headers.get('x-vercel-ip-country-region')
    const vercelCity = request.headers.get('x-vercel-ip-city')

    // Cloudflare headers (automatically set when using Cloudflare)
    const cfCountry = request.headers.get('cf-ipcountry')
    const cfCity = request.headers.get('cf-ipcity')

    return {
        countryCode: vercelCountry ?? cfCountry ?? undefined,
        region: vercelRegion ?? undefined,
        city: vercelCity ?? cfCity ?? undefined,
    }
}

/**
 * Validate and sanitize page view payload
 */
function validatePayload(body: unknown): PageViewPayload | null {
    if (!body || typeof body !== 'object') {
        return null
    }

    const data = body as Record<string, unknown>

    // Required fields
    if (typeof data.pagePath !== 'string' || !data.pagePath) {
        return null
    }
    if (typeof data.pageUrl !== 'string' || !data.pageUrl) {
        return null
    }

    // Sanitize and return validated payload
    return {
        pagePath: data.pagePath.slice(0, 500),
        pageUrl: String(data.pageUrl).slice(0, 2000),
        pageTitle:
            typeof data.pageTitle === 'string'
                ? data.pageTitle.slice(0, 500)
                : undefined,
        referrer:
            typeof data.referrer === 'string'
                ? data.referrer.slice(0, 2000)
                : undefined,
        sessionId:
            typeof data.sessionId === 'string'
                ? data.sessionId.slice(0, 64)
                : undefined,
        utmSource:
            typeof data.utmSource === 'string'
                ? data.utmSource.slice(0, 255)
                : undefined,
        utmMedium:
            typeof data.utmMedium === 'string'
                ? data.utmMedium.slice(0, 255)
                : undefined,
        utmCampaign:
            typeof data.utmCampaign === 'string'
                ? data.utmCampaign.slice(0, 255)
                : undefined,
        utmContent:
            typeof data.utmContent === 'string'
                ? data.utmContent.slice(0, 255)
                : undefined,
        utmTerm:
            typeof data.utmTerm === 'string'
                ? data.utmTerm.slice(0, 255)
                : undefined,
    }
}

/**
 * POST handler for page view tracking
 *
 * Accepts page view data and records it asynchronously.
 * Returns immediately to avoid blocking the client.
 *
 * @param request - Next.js request object
 * @returns JSON response indicating tracking was queued
 */
export async function POST(
    request: NextRequest
): Promise<NextResponse<PageViewResponse>> {
    try {
        // Parse request body
        let body: unknown
        try {
            body = await request.json()
        } catch {
            // Handle sendBeacon with blob body
            return NextResponse.json({ success: true }, { status: 200 })
        }

        // Validate payload
        const payload = validatePayload(body)
        if (!payload) {
            return NextResponse.json(
                { success: false, message: 'Invalid payload' },
                { status: 400 }
            )
        }

        // Extract user agent and geo info
        const userAgent = request.headers.get('user-agent')
        const parsedUA = parseUserAgent(userAgent)
        const geoInfo = extractGeoInfo(request)

        // Prepare database record
        const insertData: InsertPageView = {
            pagePath: payload.pagePath,
            pageUrl: payload.pageUrl,
            pageTitle: payload.pageTitle,
            referrer: payload.referrer,
            sessionId: payload.sessionId,

            // UTM parameters
            utmSource: payload.utmSource,
            utmMedium: payload.utmMedium,
            utmCampaign: payload.utmCampaign,
            utmContent: payload.utmContent,
            utmTerm: payload.utmTerm,

            // Device info
            userAgent: userAgent ?? undefined,
            deviceType: parsedUA.deviceType,
            browser: parsedUA.browser,
            browserVersion: parsedUA.browserVersion,
            os: parsedUA.os,
            osVersion: parsedUA.osVersion,

            // Geo info (IP is NOT stored)
            countryCode: geoInfo.countryCode,
            region: geoInfo.region,
            city: geoInfo.city,
        }

        // Insert asynchronously - don't await to return quickly
        // Use Promise.resolve().then() pattern for truly async execution
        Promise.resolve().then(async () => {
            try {
                await db.insert(pageView).values(insertData)
            } catch (error) {
                // Log but don't fail - analytics should never break the user experience
                console.error('[Analytics] Failed to record page view:', error)
            }
        })

        // Return immediately
        return NextResponse.json({ success: true }, { status: 200 })
    } catch (error) {
        console.error('[Analytics] Page view API error:', error)
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

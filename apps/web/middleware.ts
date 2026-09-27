import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import {
    assignLpCopyVariant,
    assignLpFormVariant,
    LP_COPY_COOKIE,
    LP_COPY_COOKIE_MAX_AGE,
    LP_COPY_HEADER,
    LP_COPY_QUERY,
    LP_FORM_COOKIE,
    LP_FORM_COOKIE_MAX_AGE,
    LP_FORM_HEADER,
    LP_FORM_QUERY,
    parseLpCopySplit,
    parseLpFormSplit,
} from '@/components/landing-pages/request-consultation/lp-form-variant'
import { env } from '@/env'

/**
 * The ads landing page, whose hero form (#292) and last-step wording (#302)
 * are under two crossed A/B tests.
 */
const LP_PATH = '/lp/request-consultation'

/**
 * Middleware to handle:
 * 1. Trailing slash redirects - redirects /path/ to /path for SEO consistency
 * 2. X-Robots-Tag header - adds noindex when crawling is disabled
 * 3. The ads landing page's test arms - chosen per visitor before the page
 *    renders, so its first HTML already has the right form and wording
 */
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Redirect trailing slashes to non-trailing slash (except root "/")
    if (pathname !== '/' && pathname.endsWith('/')) {
        const url = request.nextUrl.clone()
        url.pathname = pathname.slice(0, -1)
        return NextResponse.redirect(url, 308) // Permanent redirect
    }

    const response =
        pathname === LP_PATH ? withLpVariants(request) : NextResponse.next()

    // Check if crawling is allowed (defaults to false)
    const allowCrawling = env.NEXT_PUBLIC_ALLOW_CRAWLING === 'true'

    // If crawling is not allowed, add X-Robots-Tag header
    if (!allowCrawling) {
        response.headers.set(
            'X-Robots-Tag',
            'noindex, nofollow, noarchive, nosnippet, noimageindex'
        )
    }

    return response
}

/**
 * Picks the landing page's form arm and copy arm (`lp-form-variant.ts`),
 * each with its own random number so the two tests are independent, passes
 * both to the page as request headers, and keeps each in its own cookie.
 */
function withLpVariants(request: NextRequest): NextResponse {
    const { searchParams } = request.nextUrl
    const form = assignLpFormVariant({
        query: searchParams.get(LP_FORM_QUERY),
        cookie: request.cookies.get(LP_FORM_COOKIE)?.value,
        split: parseLpFormSplit(env.LP_FORM_SPLIT),
        random: Math.random(),
    }).variant
    const copy = assignLpCopyVariant({
        query: searchParams.get(LP_COPY_QUERY),
        cookie: request.cookies.get(LP_COPY_COOKIE)?.value,
        split: parseLpCopySplit(env.LP_COPY_SPLIT),
        random: Math.random(),
    }).variant

    const headers = new Headers(request.headers)
    headers.set(LP_FORM_HEADER, form)
    headers.set(LP_COPY_HEADER, copy)
    const response = NextResponse.next({ request: { headers } })
    const cookie = {
        path: '/lp',
        sameSite: 'lax',
        secure: request.nextUrl.protocol === 'https:',
    } as const
    response.cookies.set(LP_FORM_COOKIE, form, {
        ...cookie,
        maxAge: LP_FORM_COOKIE_MAX_AGE,
    })
    response.cookies.set(LP_COPY_COOKIE, copy, {
        ...cookie,
        maxAge: LP_COPY_COOKIE_MAX_AGE,
    })
    return response
}

// Configure which routes the middleware should run on
export const config = {
    // Match all request paths except static files and API routes
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc.)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
    ],
}

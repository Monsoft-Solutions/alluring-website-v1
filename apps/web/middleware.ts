import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import {
    assignLpFormVariant,
    LP_FORM_COOKIE,
    LP_FORM_COOKIE_MAX_AGE,
    LP_FORM_HEADER,
    LP_FORM_QUERY,
    parseLpFormSplit,
} from '@/components/landing-pages/request-consultation/lp-form-variant'
import { env } from '@/env'

/** The ads landing page, whose hero form is under an A/B test (#292). */
const LP_PATH = '/lp/request-consultation'

/**
 * Middleware to handle:
 * 1. Trailing slash redirects - redirects /path/ to /path for SEO consistency
 * 2. X-Robots-Tag header - adds noindex when crawling is disabled
 * 3. The ads landing page's form arm - chosen per visitor before the page
 *    renders, so its first HTML already has the right form
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
        pathname === LP_PATH ? withLpFormVariant(request) : NextResponse.next()

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
 * Picks the landing page's form arm (`lp-form-variant.ts`), passes it to the
 * page as a request header, and keeps it in the visitor's cookie.
 */
function withLpFormVariant(request: NextRequest): NextResponse {
    const { variant } = assignLpFormVariant({
        query: request.nextUrl.searchParams.get(LP_FORM_QUERY),
        cookie: request.cookies.get(LP_FORM_COOKIE)?.value,
        split: parseLpFormSplit(env.LP_FORM_SPLIT),
        random: Math.random(),
    })

    const headers = new Headers(request.headers)
    headers.set(LP_FORM_HEADER, variant)
    const response = NextResponse.next({ request: { headers } })
    response.cookies.set(LP_FORM_COOKIE, variant, {
        path: '/lp',
        maxAge: LP_FORM_COOKIE_MAX_AGE,
        sameSite: 'lax',
        secure: request.nextUrl.protocol === 'https:',
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

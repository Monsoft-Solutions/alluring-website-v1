import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { env } from '@/env'

/**
 * Middleware to add X-Robots-Tag header when crawling is disabled
 *
 * This provides an additional layer of protection by setting HTTP headers
 * that search engines respect, even if they don't check robots.txt or meta tags.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function middleware(_request: NextRequest) {
    const response = NextResponse.next()

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

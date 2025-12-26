import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { env } from '@/env'

/**
 * Middleware to handle:
 * 1. Trailing slash redirects - redirects /path/ to /path for SEO consistency
 * 2. X-Robots-Tag header - adds noindex when crawling is disabled
 */
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Redirect trailing slashes to non-trailing slash (except root "/")
    if (pathname !== '/' && pathname.endsWith('/')) {
        const url = request.nextUrl.clone()
        url.pathname = pathname.slice(0, -1)
        return NextResponse.redirect(url, 308) // Permanent redirect
    }

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

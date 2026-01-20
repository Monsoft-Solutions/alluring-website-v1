import { betterFetch } from '@better-fetch/fetch'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import type { Session } from '@/lib/auth'

/**
 * Public paths that don't require authentication
 */
const PUBLIC_PATHS = ['/login', '/signup', '/accept-invitation', '/api/auth']

/**
 * Middleware for Better-Auth session validation
 *
 * - Protects all dashboard routes
 * - Allows public paths (login, signup, accept-invitation, api/auth)
 * - Redirects unauthenticated users to login
 * - Redirects banned users to login with error
 */
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Allow public paths
    if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
        return NextResponse.next()
    }

    // Get session from Better-Auth
    const { data: session } = await betterFetch<Session>(
        '/api/auth/get-session',
        {
            baseURL: request.nextUrl.origin,
            headers: {
                cookie: request.headers.get('cookie') || '',
            },
        }
    )

    // No session - redirect to login
    if (!session) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Check if user is banned
    if (session.user.banned) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('error', 'banned')
        // Clear the session cookie
        const response = NextResponse.redirect(loginUrl)
        response.cookies.delete('better-auth.session_token')
        return response
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all paths except:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico
         * - public files
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { env } from '@/env'
import { verifyToken } from '@/lib/utils/crypto.util'

const PUBLIC_PATHS = ['/login', '/api/auth']

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Allow public paths
    if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
        return NextResponse.next()
    }

    // Check for auth cookie
    const authCookie = request.cookies.get('admin-auth')

    if (!authCookie?.value) {
        console.log('❌ No cookie found, redirecting to login')
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Verify HMAC signature and check expiry using Edge-compatible Web Crypto API
    try {
        const payload = await verifyToken(authCookie.value, env.AUTH_SECRET)

        // Token must be valid, have correct prefix, and not be expired
        if (
            !payload ||
            payload.prefix !== 'admin' ||
            payload.expiresAt < Date.now()
        ) {
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('redirect', pathname)
            return NextResponse.redirect(loginUrl)
        }
    } catch (error) {
        console.error('❌ Token verification error:', error)
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
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

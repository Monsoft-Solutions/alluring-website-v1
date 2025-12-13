/**
 * Admin Authentication Utilities
 *
 * Provides centralized authentication checks for the admin app.
 * Uses HMAC-SHA256 signed tokens with expiry validation.
 */
import { cookies } from 'next/headers'

import { env } from '@/env'
import { verifyToken } from './crypto.util'

const COOKIE_NAME = 'admin-auth'

/**
 * Custom error thrown when authentication fails.
 * Used for type-safe error handling in server actions.
 */
export class UnauthorizedError extends Error {
    constructor(message = 'Unauthorized') {
        super(message)
        this.name = 'UnauthorizedError'
    }
}

/**
 * Checks if the current request has a valid admin authentication cookie.
 * Verifies HMAC signature and checks expiry timestamp.
 *
 * @returns true if authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
    const cookieStore = await cookies()
    const authCookie = cookieStore.get(COOKIE_NAME)

    if (!authCookie?.value) {
        return false
    }

    try {
        // Verify HMAC signature and decode payload
        const payload = await verifyToken(authCookie.value, env.AUTH_SECRET)

        // Check if token is valid, has correct prefix, and is not expired
        return (
            payload !== null &&
            payload.prefix === 'admin' &&
            payload.expiresAt > Date.now()
        )
    } catch {
        return false
    }
}

/**
 * Requires authentication for server actions.
 * Throws an error if the user is not authenticated.
 *
 * @throws {UnauthorizedError} if not authenticated
 */
export async function requireAuth(): Promise<void> {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
        throw new UnauthorizedError()
    }
}

/**
 * Admin Authentication Utilities
 *
 * Provides centralized authentication checks for the admin app.
 * Uses a simple cookie-based authentication system with base64-encoded tokens.
 */
import { cookies } from 'next/headers'

const COOKIE_NAME = 'admin-auth'
const COOKIE_PREFIX = 'admin:'

/**
 * Checks if the current request has a valid admin authentication cookie.
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
        // Decode and validate the cookie format
        const decoded = Buffer.from(authCookie.value, 'base64').toString()
        return decoded.startsWith(COOKIE_PREFIX)
    } catch {
        return false
    }
}

/**
 * Requires authentication for server actions.
 * Throws an error if the user is not authenticated.
 *
 * @throws {Error} with message "Unauthorized" if not authenticated
 */
export async function requireAuth(): Promise<void> {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
        throw new Error('Unauthorized')
    }
}

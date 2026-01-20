/**
 * Admin Authentication Utilities
 *
 * Provides centralized authentication and authorization checks for the admin app.
 * Uses Better-Auth for session management and role-based access control.
 */
import { headers } from 'next/headers'

import { auth, type Session } from '@/lib/auth'

/**
 * User roles for the admin dashboard
 */
export type UserRole = 'admin' | 'viewer'

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
 * Custom error thrown when authorization fails.
 * Used when user doesn't have required role.
 */
export class ForbiddenError extends Error {
    constructor(message = 'Forbidden - Insufficient permissions') {
        super(message)
        this.name = 'ForbiddenError'
    }
}

/**
 * Gets the current session from Better-Auth.
 *
 * @returns Session object or null if not authenticated
 */
export async function getSession(): Promise<Session | null> {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        })
        return session
    } catch {
        return null
    }
}

/**
 * Checks if the current request has a valid session.
 *
 * @returns true if authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
    const session = await getSession()
    return session !== null && !session.user.banned
}

/**
 * Requires authentication for server actions.
 * Throws an error if the user is not authenticated.
 *
 * @throws {UnauthorizedError} if not authenticated
 * @returns Session object
 */
export async function requireAuth(): Promise<Session> {
    const session = await getSession()

    if (!session) {
        throw new UnauthorizedError()
    }

    if (session.user.banned) {
        throw new UnauthorizedError('Account is banned')
    }

    return session
}

/**
 * Requires admin role for server actions.
 * Throws an error if the user is not an admin.
 *
 * @throws {UnauthorizedError} if not authenticated
 * @throws {ForbiddenError} if not an admin
 * @returns Session object
 */
export async function requireAdmin(): Promise<Session> {
    const session = await requireAuth()

    if (session.user.role !== 'admin') {
        throw new ForbiddenError('Admin access required')
    }

    return session
}

/**
 * Requires viewer or admin role for server actions.
 * Used for read-only operations.
 *
 * @throws {UnauthorizedError} if not authenticated
 * @throws {ForbiddenError} if not a viewer or admin
 * @returns Session object
 */
export async function requireViewer(): Promise<Session> {
    const session = await requireAuth()

    const allowedRoles: UserRole[] = ['admin', 'viewer']
    if (!allowedRoles.includes(session.user.role as UserRole)) {
        throw new ForbiddenError('Viewer access required')
    }

    return session
}

/**
 * Checks if the current user has admin role.
 *
 * @returns true if user is admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
    const session = await getSession()
    return session?.user.role === 'admin'
}

/**
 * Gets the current user's role.
 *
 * @returns User role or null if not authenticated
 */
export async function getUserRole(): Promise<UserRole | null> {
    const session = await getSession()
    return (session?.user.role as UserRole) ?? null
}

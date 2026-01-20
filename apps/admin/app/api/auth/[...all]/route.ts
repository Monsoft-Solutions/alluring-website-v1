import { toNextJsHandler } from 'better-auth/next-js'

import { auth } from '@/lib/auth'

/**
 * Better-Auth API Route Handler
 *
 * Handles all authentication endpoints:
 * - POST /api/auth/sign-in/email - Email/password sign in
 * - POST /api/auth/sign-up/email - Email/password sign up
 * - POST /api/auth/sign-out - Sign out
 * - GET /api/auth/session - Get current session
 * - POST /api/auth/organization/* - Organization management
 * - POST /api/auth/admin/* - Admin user management
 */
export const { GET, POST } = toNextJsHandler(auth)

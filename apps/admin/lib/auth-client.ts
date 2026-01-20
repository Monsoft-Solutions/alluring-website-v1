import { adminClient, organizationClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

/**
 * Better-Auth client for client-side authentication
 *
 * Provides hooks and methods for:
 * - Sign in/out
 * - Session management
 * - Organization/invitation management
 * - Admin user management
 */
export const authClient = createAuthClient({
    plugins: [adminClient(), organizationClient()],
})

// Export commonly used hooks and methods
export const {
    signIn,
    signOut,
    signUp,
    useSession,
    getSession,
    // Organization methods
    organization,
    // Admin methods
    admin,
} = authClient

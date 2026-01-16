import * as bcrypt from 'bcryptjs'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin, organization } from 'better-auth/plugins'

import { db } from '@workspace/db/client'

import { env } from '@/env'
import { sendInvitationEmail } from '@/lib/email'

const SALT_ROUNDS = 10

/**
 * Better-Auth configuration for the admin dashboard
 *
 * Features:
 * - Email/password authentication
 * - Organization-based access (single org for this app)
 * - Admin plugin for user management (ban/unban, list users)
 * - Role-based access control (admin, viewer)
 */
export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: 'pg',
    }),

    // Base URL for auth endpoints
    baseURL: env.BETTER_AUTH_URL,

    // Secret for signing sessions
    secret: env.BETTER_AUTH_SECRET,

    // Email and password authentication
    emailAndPassword: {
        enabled: true,
        // Require email verification is disabled for admin dashboard
        // since users are invited by admins
        requireEmailVerification: false,
        // Use bcrypt for password hashing (must match seed script)
        password: {
            hash: async (password) => {
                return await bcrypt.hash(password, SALT_ROUNDS)
            },
            verify: async ({ hash, password }) => {
                return await bcrypt.compare(password, hash)
            },
        },
    },

    // Session configuration
    session: {
        // 7-day session expiry
        expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
        // Update session expiry on each request
        updateAge: 60 * 60 * 24, // 1 day - refresh session if older than this
        // Cookie configuration
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5, // 5 minutes - cache session in cookie to reduce DB lookups
        },
    },

    // User configuration
    user: {
        // Additional fields stored on user
        additionalFields: {
            role: {
                type: 'string',
                required: false,
                defaultValue: 'viewer',
                input: false, // Cannot be set by user during signup
            },
        },
    },

    // Plugins
    plugins: [
        // Admin plugin for user management
        admin({
            // Default role for new users
            defaultRole: 'viewer',
        }),

        // Organization plugin for invitation system
        organization({
            // Send invitation emails
            async sendInvitationEmail(data) {
                const inviteLink = `${env.BETTER_AUTH_URL}/accept-invitation/${data.id}`

                await sendInvitationEmail({
                    email: data.email,
                    invitedByName: data.inviter.user.name,
                    invitedByEmail: data.inviter.user.email,
                    organizationName: data.organization.name,
                    inviteLink,
                    role: data.role,
                })
            },
        }),
    ],
})

// Export auth types for use in other files
export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user

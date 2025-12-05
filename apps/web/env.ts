/* eslint-disable no-restricted-properties */
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

// Only load dotenv in server-side environments
// When this module is imported client-side, skip dotenv loading
if (typeof window === 'undefined') {
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const dotenv = require('dotenv')
        dotenv.config({ path: '.env.local' })
        dotenv.config()
    } catch {
        // Dotenv not available or already loaded
    }
}

/**
 * Environment Variables Configuration
 *
 * Note: Most site/business data is centralized in `lib/data/site-config.ts`.
 * Only environment-specific variables are defined here.
 *
 * NEXT_PUBLIC_SITE_URL is used by site-config.ts for environment-aware URL handling.
 */
export const env = createEnv({
    server: {
        // Database & Storage (required for runtime)
        POSTGRES_URL: z.string().url(),
        BLOG_API_KEY: z.string().min(1),
        BLOB_READ_WRITE_TOKEN: z.string().min(1).optional(),
        VERCEL_URL: z.string().optional(),

        // Email (required for contact form)
        RESEND_API_KEY: z.string().min(1),
        RESEND_FROM_EMAIL: z.string().email(),
        OWNER_EMAIL: z.string().email(),

        // Cache revalidation (required for on-demand ISR from admin)
        REVALIDATION_SECRET: z.string().min(32),

        // AI Chat (required for chat agent)
        OPENAI_API_KEY: z.string().min(1).optional(),
    },
    client: {
        // Site URL - used by site-config.ts (with fallback to VERCEL_URL)
        NEXT_PUBLIC_SITE_URL: z.string().url().optional(),

        // Other SEO variables are OPTIONAL - defaults come from site-config.ts
        NEXT_PUBLIC_SITE_NAME: z.string().min(1).optional(),
        NEXT_PUBLIC_SITE_DESCRIPTION: z.string().min(1).optional(),
        NEXT_PUBLIC_TWITTER_HANDLE: z.string().optional(),
        NEXT_PUBLIC_FACEBOOK_APP_ID: z.string().optional(),
        NEXT_PUBLIC_LOCALE: z.string().optional(),
        NEXT_PUBLIC_ENABLE_INDEXING: z.enum(['true', 'false']).optional(),

        // Analytics configuration (all optional)
        NEXT_PUBLIC_GA_MEASUREMENT_ID: z
            .string()
            .regex(/^G-[A-Z0-9]{10}$/)
            .optional(),
        NEXT_PUBLIC_CLARITY_PROJECT_ID: z.string().optional(),
        NEXT_PUBLIC_GTM_ID: z.string().optional(),
        NEXT_PUBLIC_FACEBOOK_PIXEL_ID: z.string().optional(),

        // Mobile call button (optional, defaults to enabled)
        NEXT_PUBLIC_ENABLE_MOBILE_CALL_BUTTON: z
            .enum(['true', 'false'])
            .optional(),

        // Crawling control (optional, defaults to 'false' to block crawling)
        NEXT_PUBLIC_ALLOW_CRAWLING: z.enum(['true', 'false']).optional(),

        // Beta mode - enables feedback button on all pages
        NEXT_PUBLIC_BETA_MODE: z.enum(['true', 'false']).optional(),

        // Chat widget enable/disable
        NEXT_PUBLIC_CHAT_ENABLED: z.enum(['true', 'false']).optional(),

        // Cookie banner enable/disable (optional, defaults to enabled)
        NEXT_PUBLIC_ENABLE_COOKIE_BANNER: z.enum(['true', 'false']).optional(),
    },
    shared: {
        NODE_ENV: z
            .enum(['development', 'production', 'test'])
            .default('development'),
    },
    // Use experimental__runtimeEnv to let Next.js handle bundling automatically
    // This prevents server-side variables from being exposed to client code
    experimental__runtimeEnv: {
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
        NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
        NEXT_PUBLIC_SITE_DESCRIPTION: process.env.NEXT_PUBLIC_SITE_DESCRIPTION,
        NEXT_PUBLIC_TWITTER_HANDLE: process.env.NEXT_PUBLIC_TWITTER_HANDLE,
        NEXT_PUBLIC_FACEBOOK_APP_ID: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
        NEXT_PUBLIC_LOCALE: process.env.NEXT_PUBLIC_LOCALE,
        NEXT_PUBLIC_ENABLE_INDEXING: process.env.NEXT_PUBLIC_ENABLE_INDEXING,
        NEXT_PUBLIC_GA_MEASUREMENT_ID:
            process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
        NEXT_PUBLIC_CLARITY_PROJECT_ID:
            process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID,
        NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
        NEXT_PUBLIC_FACEBOOK_PIXEL_ID:
            process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID,
        NEXT_PUBLIC_ENABLE_MOBILE_CALL_BUTTON:
            process.env.NEXT_PUBLIC_ENABLE_MOBILE_CALL_BUTTON,
        NEXT_PUBLIC_ALLOW_CRAWLING: process.env.NEXT_PUBLIC_ALLOW_CRAWLING,
        NEXT_PUBLIC_BETA_MODE: process.env.NEXT_PUBLIC_BETA_MODE,
        NEXT_PUBLIC_CHAT_ENABLED: process.env.NEXT_PUBLIC_CHAT_ENABLED,
        NEXT_PUBLIC_ENABLE_COOKIE_BANNER:
            process.env.NEXT_PUBLIC_ENABLE_COOKIE_BANNER,
        NODE_ENV: process.env.NODE_ENV,
    },

    // Called when server variables are accessed on the client.
    onInvalidAccess: (variable: string) => {
        throw new Error(
            `❌ Attempted to access a server-side environment variable on the client: ${variable}`
        )
    },
})

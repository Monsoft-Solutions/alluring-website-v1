import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

// Relative, not `@/lib/...`: next.config.mjs loads this file through jiti to
// validate the environment during the build, and jiti resolves without the
// TypeScript path aliases.
import { publicEnv } from './lib/env/public-env'

// Only load dotenv in server-side environments
// When this module is imported client-side, skip dotenv loading
if (typeof window === 'undefined') {
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const dotenv = require('dotenv') as {
            config: (options?: { path?: string }) => { error?: Error }
        }
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
        POSTGRES_URL: z.url(),
        BLOG_API_KEY: z.string().min(1),
        BLOB_READ_WRITE_TOKEN: z.string().min(1).optional(),
        VERCEL_URL: z.string().optional(),

        // Email (required for contact form)
        RESEND_API_KEY: z.string().min(1),
        RESEND_FROM_EMAIL: z.string().email(),
        OWNER_EMAIL: z.string().email(),
        SEND_CONFIRMATION_EMAIL: z.enum(['true', 'false']).optional(),

        // Cache revalidation (required for on-demand ISR from admin)
        REVALIDATION_SECRET: z.string().min(32),

        // AI Chat (required for chat agent)
        OPENAI_API_KEY: z.string().min(1).optional(),

        // ElevenLabs Speech-to-Text (optional - enables voice input in chat)
        ELEVENLABS_API_KEY: z.string().min(1).optional(),

        // Langfuse Observability (optional)
        // These are read directly by Langfuse SDK, but documented here for clarity
        LANGFUSE_SECRET_KEY: z.string().optional(),
        LANGFUSE_PUBLIC_KEY: z.string().optional(),
        LANGFUSE_BASE_URL: z.url().optional(),
        LANGFUSE_ENABLED: z.enum(['true', 'false']).optional(),

        // Google Indexing API (optional - required for google:index script)
        GOOGLE_CLIENT_EMAIL: z.email().optional(),
        GOOGLE_PRIVATE_KEY: z.string().optional(),
        // N8N Webhook Integration (optional - enables lead sync to CRM)
        N8N_WEBHOOK_URL: z.url().optional(),

        // Set by CI providers. Read by data-consistency assertions that should
        // fail a pipeline rather than only log — `NODE_ENV` is 'production'
        // during `next build`, so it cannot tell CI apart on its own.
        CI: z.string().optional(),
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

        // Loquent external chat widget enable/disable
        NEXT_PUBLIC_LOQUENT_CHAT_ENABLED: z.enum(['true', 'false']).optional(),

        // Cookie banner enable/disable (optional, defaults to enabled)
        NEXT_PUBLIC_ENABLE_COOKIE_BANNER: z.enum(['true', 'false']).optional(),
    },
    shared: {
        NODE_ENV: z
            .enum(['development', 'production', 'test'])
            .default('development'),
    },
    // Use experimental__runtimeEnv to let Next.js handle bundling automatically
    // This prevents server-side variables from being exposed to client code.
    //
    // The values come from `publicEnv` rather than being spelled out again
    // here. That keeps one list of public variables instead of two, and makes
    // drift a compile error: this field is typed as exactly the `client` plus
    // `shared` keys, so adding a variable above without adding it to
    // `publicEnv` fails typecheck.
    experimental__runtimeEnv: publicEnv,

    // Called when server variables are accessed on the client.
    onInvalidAccess: (variable: string) => {
        throw new Error(
            `❌ Attempted to access a server-side environment variable on the client: ${variable}`
        )
    },
})

/* eslint-disable no-restricted-properties */
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

// Only load dotenv in server-side environments
if (typeof window === 'undefined') {
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const dotenv = require('dotenv') as {
            config: (options?: { path?: string }) => void
        }
        dotenv.config({ path: '.env.local' })
        dotenv.config()
    } catch {
        // Dotenv not available or already loaded
    }
}

/**
 * Admin Dashboard Environment Variables
 */
export const env = createEnv({
    server: {
        // Database
        POSTGRES_URL: z.string(),

        // Admin authentication (min 4 chars for dev, use longer in production)
        ADMIN_PASSWORD: z.string().min(4),

        // Auth signing secret (minimum 32 chars for HMAC-SHA256)
        AUTH_SECRET: z.string().min(32),

        // Vercel Blob storage for media uploads
        BLOB_READ_WRITE_TOKEN: z.string().min(1),

        // Cache revalidation secret for invalidating web app cache
        REVALIDATION_SECRET: z.string().min(32),

        // OpenAI API key for chat testing
        OPENAI_API_KEY: z.string().min(1).optional(),

        // ScrapeSocial API key for Instagram scraping (optional - can be stored in DB)
        SCRAPE_SOCIAL_API_KEY: z.string().optional(),

        // Langfuse Observability (optional)
        // These are read directly by Langfuse SDK, but documented here for clarity
        LANGFUSE_SECRET_KEY: z.string().optional(),
        LANGFUSE_PUBLIC_KEY: z.string().optional(),
        LANGFUSE_BASE_URL: z.string().url().optional(),
        LANGFUSE_ENABLED: z.enum(['true', 'false']).optional(),

        // fal.ai for AI image generation
        FAL_KEY: z.string().min(1),

        // Google Search Console API (optional - for SEO insights)
        // Use same service account as Google Indexing API
        GOOGLE_CLIENT_EMAIL: z.string().email().optional(),
        GOOGLE_PRIVATE_KEY: z.string().optional(),
        // Site URL for Search Console - use "sc-domain:example.com" for domain properties
        // or "https://example.com" for URL-prefix properties
        GOOGLE_SEARCH_CONSOLE_SITE_URL: z.string().optional(),

        // Tavily API key for web search (optional)
        // Get one at https://tavily.com
        TAVILY_API_KEY: z.string().optional(),

        // Google Custom Search API (optional - for research searches)
        // Create API key at https://console.cloud.google.com/apis/credentials
        // Create search engine at https://programmablesearchengine.google.com
        GOOGLE_CUSTOM_SEARCH_API_KEY: z.string().optional(),
        GOOGLE_CUSTOM_SEARCH_ENGINE_ID: z.string().optional(),
    },
    client: {
        // Public web app URL for building absolute links
        NEXT_PUBLIC_WEB_URL: z.url(),
    },
    shared: {
        NODE_ENV: z
            .enum(['development', 'production', 'test'])
            .default('development'),
    },
    experimental__runtimeEnv: {
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_WEB_URL: process.env.NEXT_PUBLIC_WEB_URL,
    },
    onInvalidAccess: (variable: string) => {
        throw new Error(
            `❌ Attempted to access a server-side environment variable on the client: ${variable}`
        )
    },
})

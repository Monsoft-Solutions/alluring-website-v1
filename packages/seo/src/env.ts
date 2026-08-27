import { createEnv } from '@t3-oss/env-core'
import z from 'zod'

/**
 * Environment configuration for SEO package
 *
 * Note: This package is shared and may be imported in both server and client contexts.
 * Environment variables are loaded by the consuming app (apps/web/env.ts,
 * apps/admin/env.ts), so we don't need to load dotenv here. Standalone Node
 * consumers — the MCP server in packages/mcp-gsc — must load their .env file
 * *before* importing anything that reaches this module, because createEnv
 * snapshots process.env at module evaluation.
 */
export const env = createEnv({
    server: {
        NODE_ENV: z
            .enum(['development', 'production', 'test'])
            .default('development'),
        VERCEL_ENV: z.enum(['production', 'preview', 'development']).optional(),
        VERCEL_URL: z.string().optional(),
        NEXT_PUBLIC_BASE_URL: z.string().optional(),

        // Google Search Console service account (see ./search-console)
        GOOGLE_CLIENT_EMAIL: z.string().email().optional(),
        GOOGLE_PRIVATE_KEY: z.string().optional(),
        /**
         * Either a domain property ("sc-domain:example.com") or a URL-prefix
         * property ("https://example.com").
         */
        GOOGLE_SEARCH_CONSOLE_SITE_URL: z.string().optional(),
    },
    runtimeEnv: typeof window === 'undefined' ? process.env : {},
})

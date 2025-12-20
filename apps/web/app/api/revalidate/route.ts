import { revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { env } from '@/env'
import {
    ALLOWED_STATIC_TAGS,
    DYNAMIC_TAG_PREFIXES,
    isValidCacheTag,
} from '@/lib/cache/cache-tags.constant'

/**
 * Request body schema for cache revalidation
 */
const revalidateRequestSchema = z.object({
    /** Secret token for authentication */
    secret: z.string().min(1, 'Secret is required'),
    /** Array of cache tags to revalidate (1-10 tags) */
    tags: z
        .array(z.string().min(1))
        .min(1, 'At least one tag is required')
        .max(10, 'Maximum 10 tags allowed per request'),
})

/**
 * POST /api/revalidate
 *
 * On-demand cache revalidation endpoint for ISR (Incremental Static Regeneration).
 * Called by the admin app when content is created, updated, or deleted.
 *
 * Security:
 * - Requires a secret token matching REVALIDATION_SECRET env variable
 * - Validates all tags against allowed list before revalidating
 *
 * @example
 * // Request body
 * {
 *   "secret": "your-revalidation-secret",
 *   "tags": ["promotions", "promotion-featured"]
 * }
 *
 * @example
 * // Success response
 * { "revalidated": ["promotions", "promotion-featured"], "timestamp": 1699999999999 }
 *
 * @example
 * // Error response (invalid tags)
 * {
 *   "error": "Invalid cache tags",
 *   "invalidTags": ["invalid-tag"],
 *   "allowedStaticTags": ["promotions", ...],
 *   "allowedDynamicPrefixes": ["promotion-", "blog-post-"]
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as unknown

        // Validate request body schema
        const parseResult = revalidateRequestSchema.safeParse(body)

        if (!parseResult.success) {
            return NextResponse.json(
                {
                    error: 'Invalid request body',
                    details: parseResult.error.issues.map((issue) => ({
                        path: issue.path.join('.'),
                        message: issue.message,
                    })),
                },
                { status: 400 }
            )
        }

        const { secret, tags } = parseResult.data

        // Authenticate request
        if (secret !== env.REVALIDATION_SECRET) {
            return NextResponse.json(
                { error: 'Invalid revalidation secret' },
                { status: 401 }
            )
        }

        // Validate all tags before revalidating any
        const invalidTags = tags.filter((tag) => !isValidCacheTag(tag))

        if (invalidTags.length > 0) {
            return NextResponse.json(
                {
                    error: 'Invalid cache tags',
                    invalidTags,
                    allowedStaticTags: ALLOWED_STATIC_TAGS,
                    allowedDynamicPrefixes: DYNAMIC_TAG_PREFIXES,
                },
                { status: 400 }
            )
        }

        // Revalidate all valid tags
        // Next.js 16+ requires a cache profile - using { expire: 0 } for immediate invalidation
        const revalidated: string[] = []

        for (const tag of tags) {
            revalidateTag(tag, { expire: 0 })
            revalidated.push(tag)
        }

        return NextResponse.json({
            revalidated,
            timestamp: Date.now(),
        })
    } catch (error) {
        // Handle JSON parse errors
        if (error instanceof SyntaxError) {
            return NextResponse.json(
                { error: 'Invalid JSON in request body' },
                { status: 400 }
            )
        }

        console.error('Revalidation error:', error)

        return NextResponse.json(
            { error: 'Internal server error during revalidation' },
            { status: 500 }
        )
    }
}

/**
 * GET /api/revalidate
 *
 * Health check endpoint that returns allowed tags.
 * Useful for debugging and verifying the endpoint is accessible.
 */
export function GET() {
    return NextResponse.json({
        status: 'ok',
        allowedStaticTags: ALLOWED_STATIC_TAGS,
        allowedDynamicPrefixes: DYNAMIC_TAG_PREFIXES,
    })
}

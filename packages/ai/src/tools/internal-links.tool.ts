/**
 * Internal Links Tool
 *
 * Provides AI agents with access to internal website pages and blog posts
 * for intelligent internal linking.
 *
 * @module @workspace/ai/tools/internal-links
 */
import { z } from 'zod'
import {
    PROCEDURE_PAGES as SHARED_PROCEDURE_PAGES,
    WEBSITE_PAGES as SHARED_WEBSITE_PAGES,
    SURGEON_PAGES as SHARED_SURGEON_PAGES,
    type SitePage,
} from '@workspace/shared'

/**
 * Internal link suggestion
 */
export type InternalLink = SitePage

/**
 * Internal links tool result
 */
export type InternalLinksResult = {
    topic: string
    suggestions: InternalLink[]
    recommendedCount: number
}

/**
 * Internal links parameters schema
 */
export const internalLinksParametersSchema = z.object({
    topic: z
        .string()
        .describe('The topic or context to find relevant internal links for'),
    currentPostSlug: z
        .string()
        .optional()
        .describe('Optional slug of the current post to exclude'),
    maxResults: z
        .number()
        .default(10)
        .describe('Maximum results to return (1-20)'),
})

export type InternalLinksParameters = z.infer<
    typeof internalLinksParametersSchema
>

/**
 * Static procedure pages available for internal linking
 * This data comes from the web app's procedure data
 */
const PROCEDURE_PAGES: InternalLink[] = SHARED_PROCEDURE_PAGES

/**
 * Static website pages available for internal linking
 */
const WEBSITE_PAGES: InternalLink[] = [
    ...SHARED_WEBSITE_PAGES,
    ...SHARED_SURGEON_PAGES,
]

/**
 * Calculate relevance score between a topic and an internal link
 */
function calculateRelevance(topic: string, link: InternalLink): number {
    const topicLower = topic.toLowerCase()
    const words = topicLower.split(/\s+/)

    let score = 0

    // Check keyword matches
    for (const keyword of link.keywords) {
        const keywordLower = keyword.toLowerCase()
        if (topicLower.includes(keywordLower)) {
            score += 10
        } else if (words.some((word) => keywordLower.includes(word))) {
            score += 5
        }
    }

    // Check title match
    if (topicLower.includes(link.title.toLowerCase())) {
        score += 15
    }

    // Check description match
    if (link.description.toLowerCase().includes(topicLower)) {
        score += 5
    }

    return score
}

/**
 * Get relevant internal links for a topic
 *
 * @param topic - The topic to find relevant links for
 * @param options - Optional configuration
 * @returns Sorted list of relevant internal links
 */
export function getInternalLinks(
    topic: string,
    options?: {
        currentPostSlug?: string
        blogPosts?: Array<{
            slug: string
            title: string
            excerpt?: string | null
        }>
        maxResults?: number
    }
): InternalLinksResult {
    const { currentPostSlug, blogPosts = [], maxResults = 10 } = options || {}

    // Combine all internal links
    const allLinks: InternalLink[] = [
        ...PROCEDURE_PAGES,
        ...WEBSITE_PAGES,
        ...blogPosts.map((post) => ({
            url: `/blog/${post.slug}`,
            title: post.title,
            description: post.excerpt || post.title,
            type: 'blog' as const,
            keywords: post.title.toLowerCase().split(/\s+/),
        })),
    ]

    // Filter out current post if specified
    const filteredLinks = currentPostSlug
        ? allLinks.filter((link) => !link.url.includes(currentPostSlug))
        : allLinks

    // Score and sort by relevance
    const scoredLinks = filteredLinks
        .map((link) => ({
            link,
            score: calculateRelevance(topic, link),
        }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, maxResults)

    return {
        topic,
        suggestions: scoredLinks.map((item) => item.link),
        recommendedCount: Math.min(3, scoredLinks.length), // Recommend 2-3 internal links
    }
}

/**
 * Execute internal links lookup
 */
export function executeInternalLinks(
    params: InternalLinksParameters
): InternalLinksResult {
    return getInternalLinks(params.topic, {
        currentPostSlug: params.currentPostSlug,
        maxResults: params.maxResults,
    })
}

/**
 * Get all available internal pages (for context)
 */
export function getAllInternalPages(): InternalLink[] {
    return [...PROCEDURE_PAGES, ...WEBSITE_PAGES]
}

/**
 * Get procedure pages only
 */
export function getProcedurePages(): InternalLink[] {
    return PROCEDURE_PAGES
}

/**
 * Tool definition for AI agents
 */
export const internalLinksToolDefinition = {
    description:
        'Find relevant internal pages and blog posts to link to in the content. Use this to add 2-3 internal links that provide additional value to readers and improve SEO.',
    parameters: internalLinksParametersSchema,
}

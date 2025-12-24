/**
 * Internal Links Tool
 *
 * Provides AI agents with access to internal website pages and blog posts
 * for intelligent internal linking.
 *
 * @module @workspace/ai/tools/internal-links
 */
import { z } from 'zod'

/**
 * Internal link suggestion
 */
export type InternalLink = {
    /** URL path (e.g., /procedures/breast-augmentation-miami) */
    url: string
    /** Page title */
    title: string
    /** Brief description */
    description: string
    /** Type of page */
    type: 'procedure' | 'blog' | 'page' | 'gallery'
    /** Keywords associated with this page */
    keywords: string[]
}

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
    maxResults: z.number().min(1).max(20).default(10),
})

export type InternalLinksParameters = z.infer<
    typeof internalLinksParametersSchema
>

/**
 * Static procedure pages available for internal linking
 * This data comes from the web app's procedure data
 */
const PROCEDURE_PAGES: InternalLink[] = [
    {
        url: '/procedures/breast-augmentation-miami',
        title: 'Breast Augmentation Miami',
        description: 'Enhance your natural shape with custom breast implants',
        type: 'procedure',
        keywords: [
            'breast augmentation',
            'breast implants',
            'breast enhancement',
            'implants',
            'augmentation',
        ],
    },
    {
        url: '/procedures/breast-lift-miami',
        title: 'Breast Lift Miami',
        description: 'Restore youthful breast shape and position',
        type: 'procedure',
        keywords: ['breast lift', 'mastopexy', 'sagging breasts', 'lift'],
    },
    {
        url: '/procedures/breast-reduction-miami',
        title: 'Breast Reduction Miami',
        description: 'Achieve comfort and proportion with breast reduction',
        type: 'procedure',
        keywords: [
            'breast reduction',
            'reduction mammaplasty',
            'large breasts',
            'reduction',
        ],
    },
    {
        url: '/procedures/liposuction-miami',
        title: 'Liposuction Miami',
        description: 'Remove stubborn fat deposits with precision liposuction',
        type: 'procedure',
        keywords: ['liposuction', 'lipo', 'fat removal', 'body contouring'],
    },
    {
        url: '/procedures/brazilian-butt-lift-bbl-miami',
        title: 'Brazilian Butt Lift (BBL) Miami',
        description: 'Enhance your curves with natural fat transfer',
        type: 'procedure',
        keywords: [
            'bbl',
            'brazilian butt lift',
            'butt lift',
            'fat transfer',
            'buttock augmentation',
        ],
    },
    {
        url: '/procedures/tummy-tuck-miami',
        title: 'Tummy Tuck Miami',
        description: 'Achieve a flatter, firmer abdomen',
        type: 'procedure',
        keywords: [
            'tummy tuck',
            'abdominoplasty',
            'abdominal surgery',
            'stomach surgery',
        ],
    },
    {
        url: '/procedures/mommy-makeover-miami',
        title: 'Mommy Makeover Miami',
        description: 'Comprehensive body restoration after pregnancy',
        type: 'procedure',
        keywords: [
            'mommy makeover',
            'post-pregnancy',
            'body restoration',
            'combination surgery',
        ],
    },
    {
        url: '/procedures/facelift-miami',
        title: 'Facelift Miami',
        description: 'Turn back the clock with facial rejuvenation',
        type: 'procedure',
        keywords: [
            'facelift',
            'rhytidectomy',
            'facial rejuvenation',
            'face surgery',
        ],
    },
    {
        url: '/procedures/blepharoplasty-miami',
        title: 'Blepharoplasty Miami',
        description: 'Refresh tired eyes with eyelid surgery',
        type: 'procedure',
        keywords: [
            'blepharoplasty',
            'eyelid surgery',
            'eye lift',
            'droopy eyelids',
        ],
    },
]

/**
 * Static website pages available for internal linking
 */
const WEBSITE_PAGES: InternalLink[] = [
    {
        url: '/about',
        title: 'About Alluring Plastic Surgery',
        description: 'Learn about our surgeons and commitment to excellence',
        type: 'page',
        keywords: ['about', 'surgeons', 'team', 'clinic', 'experience'],
    },
    {
        url: '/plastic-surgery-financing-miami',
        title: 'Plastic Surgery Financing Miami',
        description: 'Flexible financing options for your procedure',
        type: 'page',
        keywords: ['financing', 'payment plans', 'cost', 'affordable', 'price'],
    },
    {
        url: '/gallery',
        title: 'Before & After Gallery',
        description: 'View real patient results from our procedures',
        type: 'gallery',
        keywords: ['gallery', 'before after', 'results', 'photos', 'pictures'],
    },
    {
        url: '/contact-us',
        title: 'Contact Us',
        description: 'Schedule your consultation today',
        type: 'page',
        keywords: [
            'contact',
            'consultation',
            'appointment',
            'schedule',
            'call',
        ],
    },
    {
        url: '/blog',
        title: 'Blog',
        description: 'Expert insights on plastic surgery',
        type: 'page',
        keywords: ['blog', 'articles', 'news', 'insights'],
    },
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

/**
 * Dynamic llms.txt Route Handler
 *
 * Generates llms.txt file for AI crawlers (ChatGPT, Claude, Perplexity)
 * following the llms.txt specification (https://llmstxt.org/)
 *
 * This provides structured information about the site for LLM consumption.
 */
import { NextResponse } from 'next/server'

import { getResolvedProcedures } from '@/lib/data/procedures.resolved.server'
import { siteConfig } from '@/lib/data/site-config'
import {
    absoluteUrl,
    financingSection,
    hoursLines,
    LLMS_INTRO,
    LLMS_SUMMARY,
    newestDate,
    practiceLines,
    pricesSection,
    surgeonSection,
} from '@/lib/llms/llms-sections.server'
import { getPublishedPostCardsPage } from '@/lib/queries/blog/post-list.query'
import { getPricing } from '@/lib/queries/pricing.query'
import { getBlogPostUrl } from '@/lib/utils/blog-url.util'
import type { Procedure } from '@/lib/types/procedure.type'

/** The procedure list for one category, linked absolutely. */
function procedureList(title: string, list: Procedure[]): string {
    if (list.length === 0) return ''
    return `### ${title}
${list.map((p) => `- [${p.title}](${absoluteUrl(`/procedures/${p.slug}`)}): ${p.shortDescription || p.description}`).join('\n')}
`
}

/**
 * Generate llms.txt content. Practice facts, the surgeon, prices and
 * financing come from the claims canon and the pricing resolver
 * (`lib/llms/llms-sections.server.ts`, #354); procedure copy is resolved for
 * claim tokens first.
 */
async function generateLlmsTxt(): Promise<string> {
    const [resolvedProcedures, pricing] = await Promise.all([
        getResolvedProcedures(),
        getPricing(),
    ])
    const byCategory = (category: Procedure['category']) =>
        resolvedProcedures.filter((p) => p.category === category)

    // Fetch recent blog posts for the content guide (titles and excerpts
    // arrive with their claim tokens resolved)
    let recentPosts: Array<{
        title: string
        slug: string
        excerpt: string | null
        publishedAt: string | null
    }> = []
    try {
        const { items } = await getPublishedPostCardsPage({ limit: 10 })
        recentPosts = items.map((post) => ({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            publishedAt: post.publishedAt,
        }))
    } catch {
        // Blog posts fetch failed, continue without them
    }

    const lastUpdated = newestDate(
        [
            ...resolvedProcedures.map((p) => p.dateModified),
            ...recentPosts.map((p) => p.publishedAt),
        ],
        pricing
    )

    const content = `# ${siteConfig.business.name}

> ${LLMS_SUMMARY}

${LLMS_INTRO}

## About Us

${practiceLines()}

${surgeonSection()}

## Procedures

${procedureList('Body Procedures', byCategory('body'))}
${procedureList('Breast Procedures', byCategory('breast'))}
${procedureList('Facial Procedures', byCategory('face'))}
${procedureList('Combined Procedures', byCategory('combined'))}
${pricesSection(pricing)}

${financingSection()}

## Patient Resources

- [Consultation](${absoluteUrl('/free-consultation')}): Book a consultation, in person in Miami or by video
- [Financing Options](${absoluteUrl('/plastic-surgery-financing-miami')}): Financing through Cherry, CareCredit and United Credit
- [Before & After Gallery](${absoluteUrl('/gallery')}): Real patient results and photos
- [Blog](${absoluteUrl('/blog')}): Procedure guides, recovery and cost articles
- [FAQs](${absoluteUrl('/faqs')}): Frequently asked questions

${
    recentPosts.length > 0
        ? `## Recent Blog Posts

${recentPosts.map((post) => `- [${post.title}](${absoluteUrl(getBlogPostUrl(post.slug, post.publishedAt))})${post.excerpt ? `: ${post.excerpt.slice(0, 100)}...` : ''}`).join('\n')}
`
        : ''
}
## Contact Information

**Address**: ${siteConfig.contact.address}, ${siteConfig.contact.city}, ${siteConfig.contact.state} ${siteConfig.contact.postalCode}
**Phone**: ${siteConfig.contact.phoneDisplay ?? siteConfig.contact.phone}
**Email**: ${siteConfig.contact.email}

**Business Hours**:
${hoursLines()}

## Social Media

${siteConfig.social.map((s) => `- [${s.label ?? s.platform}](${s.url})`).join('\n')}

## Optional

- [Full Documentation](${absoluteUrl('/llms-full.txt')}): Every procedure in detail, with FAQs and the full price list
- [Privacy Policy](${absoluteUrl('/privacy')})
- [Terms of Service](${absoluteUrl('/terms')})
- [Sitemap](${absoluteUrl('/sitemap.xml')})
${lastUpdated ? `\n*Last updated: ${lastUpdated}*\n` : ''}`

    return content
}

export async function GET() {
    try {
        const content = await generateLlmsTxt()

        return new NextResponse(content, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                // A short CDN cache (#354): revalidateTag('pricing') does not
                // purge a response Vercel's edge holds for its s-maxage, so a
                // day-long one kept a price edit off this file for a day.
                // Ten minutes, then served stale while it refreshes.
                'Cache-Control':
                    'public, max-age=600, s-maxage=600, stale-while-revalidate=3600',
            },
        })
    } catch (error) {
        console.error('Error generating llms.txt:', error)

        // Return a basic fallback
        return new NextResponse(
            `# ${siteConfig.business.name}\n\n> ${LLMS_SUMMARY}\n\nVisit our website for more information.`,
            {
                status: 500,
                headers: {
                    'Content-Type': 'text/plain; charset=utf-8',
                },
            }
        )
    }
}

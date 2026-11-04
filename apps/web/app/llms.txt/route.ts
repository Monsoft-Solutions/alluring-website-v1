/**
 * Dynamic llms.txt Route Handler
 *
 * Generates llms.txt file for AI crawlers (ChatGPT, Claude, Perplexity)
 * following the llms.txt specification (https://llmstxt.org/)
 *
 * This provides structured information about the site for LLM consumption.
 */
import { NextResponse } from 'next/server'

import { procedures } from '@/lib/data/procedures.data'
import { siteConfig, getFullAddress } from '@/lib/data/site-config'
import {
    KARLINSKY_CREDENTIALS,
    KARLINSKY_NAME,
} from '@/lib/data/surgeons/karlinsky-credentials.constant'
import { getPublishedPostCardsPage } from '@/lib/queries/blog/post-list.query'
import { getBlogPostUrl } from '@/lib/utils/blog-url.util'

/**
 * The file's one-line summary. Not `siteConfig.business.description`, whose
 * "World-class" and "Where luxury meets affordability" answer engines repeat.
 */
const SUMMARY = `${siteConfig.business.tagline} Cosmetic surgery in Miami, Florida, with personalized care and financing available.`

/**
 * Group procedures by category
 */
function groupProceduresByCategory() {
    const categories = {
        body: procedures.filter((p) => p.category === 'body'),
        breast: procedures.filter((p) => p.category === 'breast'),
        face: procedures.filter((p) => p.category === 'face'),
        combined: procedures.filter((p) => p.category === 'combined'),
    }
    return categories
}

/**
 * Format business hours for display
 */
function formatBusinessHours(): string {
    if (
        !siteConfig.contact.businessHours ||
        siteConfig.contact.businessHours.length === 0
    ) {
        return '- Contact us for hours'
    }
    return siteConfig.contact.businessHours
        .map(
            (h) =>
                `- ${h.days}: ${h.open === 'Closed' ? 'Closed' : `${h.open} - ${h.close}`}`
        )
        .join('\n')
}

/**
 * Generate llms.txt content
 */
async function generateLlmsTxt(): Promise<string> {
    const categories = groupProceduresByCategory()

    // Fetch recent blog posts for the content guide
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

    const content = `# ${siteConfig.business.name}

> ${SUMMARY}

${siteConfig.business.name} is a plastic surgery practice in Miami, Florida, offering breast augmentation, Brazilian butt lift (BBL), liposuction, tummy tuck, mommy makeover, and facial procedures. ${KARLINSKY_NAME}, is the practice's one surgeon. ${KARLINSKY_CREDENTIALS}

## About Us

**Business Name**: ${siteConfig.business.name}${
        siteConfig.business.legalName
            ? `
**Legal Name**: ${siteConfig.business.legalName}`
            : ''
    }${
        siteConfig.business.tagline
            ? `
**Tagline**: ${siteConfig.business.tagline}`
            : ''
    }${
        siteConfig.business.organizationType
            ? `
**Type**: ${siteConfig.business.organizationType}`
            : ''
    }

**Location**: ${getFullAddress()}
**Phone**: ${siteConfig.contact.phoneDisplay ?? siteConfig.contact.phone}
**Email**: ${siteConfig.contact.email}

**Surgeon**: ${KARLINSKY_NAME}. ${KARLINSKY_CREDENTIALS}${
        siteConfig.trustStats
            ? `
**Patient Rating**: ${siteConfig.trustStats.rating} stars`
            : ''
    }

## Procedures

${
    categories.body.length > 0
        ? `### Body Procedures
${categories.body.map((p) => `- [${p.title}](/procedures/${p.slug}): ${p.shortDescription || p.description}`).join('\n')}
`
        : ''
}
${
    categories.breast.length > 0
        ? `### Breast Procedures
${categories.breast.map((p) => `- [${p.title}](/procedures/${p.slug}): ${p.shortDescription || p.description}`).join('\n')}
`
        : ''
}
${
    categories.face.length > 0
        ? `### Facial Procedures
${categories.face.map((p) => `- [${p.title}](/procedures/${p.slug}): ${p.shortDescription || p.description}`).join('\n')}
`
        : ''
}
${
    categories.combined.length > 0
        ? `### Combined Procedures
${categories.combined.map((p) => `- [${p.title}](/procedures/${p.slug}): ${p.shortDescription || p.description}`).join('\n')}
`
        : ''
}
## Patient Resources

- [Free Consultation](/free-consultation): Schedule a complimentary consultation with our surgeon
- [Financing Options](/plastic-surgery-financing-miami): Payment plans through Cherry, CareCredit, and United Credit
- [Before & After Gallery](/gallery): Real patient results and transformation photos
- [Blog](/blog): Expert plastic surgery guides, recovery tips, and educational content
- [FAQs](/faqs): Frequently asked questions about plastic surgery

${
    recentPosts.length > 0
        ? `## Recent Blog Posts

${recentPosts.map((post) => `- [${post.title}](${getBlogPostUrl(post.slug, post.publishedAt)})${post.excerpt ? `: ${post.excerpt.slice(0, 100)}...` : ''}`).join('\n')}
`
        : ''
}
## Why Choose ${siteConfig.business.name}

1. **One surgeon**: ${KARLINSKY_NAME}. ${KARLINSKY_CREDENTIALS}${
        siteConfig.trustStats
            ? `
2. **${siteConfig.trustStats.rating}-Star Rating**: Across review platforms`
            : ''
    }
3. **Flexible Financing**: Multiple payment options including 0% APR plans through Cherry, CareCredit, and United Credit
4. **Bilingual Staff**: English and Spanish speaking team to serve our diverse patient base

## Contact Information

**Address**: ${getFullAddress()}
**Phone**: ${siteConfig.contact.phoneDisplay ?? siteConfig.contact.phone}
**Email**: ${siteConfig.contact.email}

**Business Hours**:
${formatBusinessHours()}

**Serving**: South Florida (Miami, Fort Lauderdale, Coral Gables, Hialeah) and patients travelling in from other US states.

## Social Media

${siteConfig.social.map((s) => `- [${s.label ?? s.platform}](${s.url})`).join('\n')}

## Optional

- [Full Documentation](/llms-full.txt): Comprehensive information including all procedure details, FAQs, and service areas
- [Privacy Policy](/privacy)
- [Terms of Service](/terms)
- [Sitemap](/sitemap.xml)
`

    return content
}

export async function GET() {
    try {
        const content = await generateLlmsTxt()

        return new NextResponse(content, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'public, max-age=3600, s-maxage=86400',
            },
        })
    } catch (error) {
        console.error('Error generating llms.txt:', error)

        // Return a basic fallback
        return new NextResponse(
            `# ${siteConfig.business.name}\n\n> ${SUMMARY}\n\nVisit our website for more information.`,
            {
                status: 500,
                headers: {
                    'Content-Type': 'text/plain; charset=utf-8',
                },
            }
        )
    }
}

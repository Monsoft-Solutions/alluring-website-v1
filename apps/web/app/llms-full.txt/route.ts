/**
 * Comprehensive llms-full.txt Route Handler
 *
 * Generates a comprehensive content dump for AI crawlers
 * including all procedures, FAQs, and detailed information.
 *
 * This is the "full" version of llms.txt with more detail.
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
    trustLines,
} from '@/lib/llms/llms-sections.server'
import { getPublishedPostCardsPage } from '@/lib/queries/blog/post-list.query'
import { getPricing } from '@/lib/queries/pricing.query'
import { getBlogPostUrl } from '@/lib/utils/blog-url.util'

/**
 * Generate comprehensive llms-full.txt content. Practice facts, the surgeon,
 * prices and financing come from the claims canon and the pricing resolver
 * (`lib/llms/llms-sections.server.ts`, #354); every procedure's copy is
 * resolved for claim tokens first.
 */
async function generateLlmsFullTxt(): Promise<string> {
    const [resolvedProcedures, pricing] = await Promise.all([
        getResolvedProcedures(),
        getPricing(),
    ])

    // Fetch recent blog posts (titles arrive with claim tokens resolved)
    let recentPosts: Array<{
        title: string
        slug: string
        excerpt: string | null
        publishedAt: string | null
    }> = []
    try {
        const { items } = await getPublishedPostCardsPage({ limit: 20 })
        recentPosts = items.map((post) => ({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            publishedAt: post.publishedAt,
        }))
    } catch {
        // Blog posts fetch failed, continue without them
    }

    // The newest real date across the content this file describes, the
    // pricing edit included. It used to print the request date, which made
    // every fetch look like a fresh edit (#250). No dates at all means no
    // claim: the line is omitted.
    const lastUpdated = newestDate(
        [
            ...resolvedProcedures.map((p) => p.dateModified),
            ...recentPosts.map((p) => p.publishedAt),
        ],
        pricing
    )

    const content = `# ${siteConfig.business.name} - Comprehensive Information Guide

> ${LLMS_SUMMARY}

${LLMS_INTRO}

This document describes the practice's procedures, surgeon, prices and services for AI assistants and language models.

---

## Business Overview

${practiceLines()}${
        siteConfig.contact.coordinates
            ? `
**Coordinates**: ${siteConfig.contact.coordinates.lat}, ${siteConfig.contact.coordinates.lng}`
            : ''
    }${
        siteConfig.contact.timezone
            ? `
**Timezone**: ${siteConfig.contact.timezone}`
            : ''
    }

### Verified Facts
${trustLines()}

### Business Hours
${hoursLines()}

---

${surgeonSection()}

---

## Procedures Offered

${resolvedProcedures
    .map(
        (p) => `### ${p.title}

**URL**: ${absoluteUrl(`/procedures/${p.slug}`)}
**Category**: ${p.category || 'General'}
**Description**: ${p.description}

${p.shortDescription ? `**Summary**: ${p.shortDescription}` : ''}

${
    p.quickStats
        ? `**Quick Facts**:
- Duration: ${p.quickStats.duration}
- Anesthesia: ${p.quickStats.anesthesia}
- Recovery: ${p.quickStats.recovery}
- Results: ${p.quickStats.results}
${p.quickStats.inpatientOutpatient ? `- Setting: ${p.quickStats.inpatientOutpatient}` : ''}
`
        : ''
}

${
    p.benefits && p.benefits.length > 0
        ? `**Benefits**:
${p.benefits.map((b) => `- **${b.title}**: ${b.description}`).join('\n')}
`
        : ''
}

${
    p.faqs && p.faqs.length > 0
        ? `**Frequently Asked Questions**:
${p.faqs
    .map(
        (faq) => `
Q: ${faq.question}
A: ${faq.answer}
`
    )
    .join('\n')}`
        : ''
}

---
`
    )
    .join('\n')}

${pricesSection(pricing)}

---

${financingSection()}

---

## Patient Resources

### Consultation
- **URL**: ${absoluteUrl('/free-consultation')}
- In person in Miami or by video
- Your surgeon confirms your price at consultation

### Before & After Gallery
- **URL**: ${absoluteUrl('/gallery')}
- Real patient results
- Categorized by procedure

### Educational Blog
- **URL**: ${absoluteUrl('/blog')}
- Procedure guides, recovery and cost articles

${
    recentPosts.length > 0
        ? `### Recent Articles
${recentPosts.map((post) => `- [${post.title}](${absoluteUrl(getBlogPostUrl(post.slug, post.publishedAt))})`).join('\n')}
`
        : ''
}

---

## Service Area

**Primary Service Area**: Miami-Dade County, FL
- Miami
- Coral Gables
- Hialeah
- Miami Beach
- Doral

**Extended Service Area**: South Florida
- Fort Lauderdale
- West Palm Beach
- Boca Raton

**Patients Flying In**: Patients fly in from other US states. If you're
flying in, Alluring confirms your surgery, pre-op and follow-up dates in
writing and tells you how many nights to stay in Miami before you're cleared
to fly home. You arrange the travel itself. The practice is not affiliated
with any recovery house. Care is available in English and Spanish.

---

## Contact & Social

**Phone**: ${siteConfig.contact.phoneDisplay ?? siteConfig.contact.phone}
**Email**: ${siteConfig.contact.email}
**Address**: ${siteConfig.contact.address}, ${siteConfig.contact.city}, ${siteConfig.contact.state} ${siteConfig.contact.postalCode}

**Social Media**:
${siteConfig.social.map((s) => `- ${s.label ?? s.platform}: ${s.url}`).join('\n')}

---

## Legal

- [Privacy Policy](${absoluteUrl('/privacy')})
- [Terms of Service](${absoluteUrl('/terms')})
- [Sitemap](${absoluteUrl('/sitemap.xml')})

---

${lastUpdated ? `*Last updated: ${lastUpdated}*\n` : ''}*This content is generated dynamically from ${siteConfig.business.name} website data.*
`

    return content
}

export async function GET() {
    try {
        const content = await generateLlmsFullTxt()

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
        console.error('Error generating llms-full.txt:', error)

        return new NextResponse(
            `# ${siteConfig.business.name}\n\nError generating full content. Please visit our website directly.`,
            {
                status: 500,
                headers: {
                    'Content-Type': 'text/plain; charset=utf-8',
                },
            }
        )
    }
}

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
import { getPublishedPostCardsPage } from '@/lib/queries/blog/post-list.query'

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
    }> = []
    try {
        const { items } = await getPublishedPostCardsPage({ limit: 10 })
        recentPosts = items.map((post) => ({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
        }))
    } catch {
        // Blog posts fetch failed, continue without them
    }

    const content = `# ${siteConfig.business.name}

> ${siteConfig.business.description}

${siteConfig.business.name} is a premier plastic surgery clinic in Miami, Florida specializing in breast augmentation, Brazilian butt lift (BBL), liposuction, tummy tuck, mommy makeover, and facial procedures.${siteConfig.trustStats ? ` Our double board-certified surgeons have performed ${siteConfig.trustStats.patients} procedures with a ${siteConfig.trustStats.rating}-star rating.` : ''}

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
${
    siteConfig.trustStats
        ? `
**Credentials**:${
              siteConfig.trustStats.accreditation
                  ? `
- ${siteConfig.trustStats.accreditation}`
                  : ''
          }
- ${siteConfig.trustStats.patients} Procedures Performed
- ${siteConfig.trustStats.years} Years of Experience
- ${siteConfig.trustStats.rating}-Star Patient Rating`
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

- [Free Consultation](/free-consultation): Schedule a complimentary consultation with our surgeons
- [Financing Options](/plastic-surgery-financing-miami): Affordable payment plans through Cherry, CareCredit, and United Credit
- [Before & After Gallery](/gallery): Real patient results and transformation photos
- [Blog](/blog): Expert plastic surgery guides, recovery tips, and educational content
- [FAQs](/faqs): Frequently asked questions about plastic surgery

${
    recentPosts.length > 0
        ? `## Recent Blog Posts

${recentPosts.map((post) => `- [${post.title}](/blog/${post.slug})${post.excerpt ? `: ${post.excerpt.slice(0, 100)}...` : ''}`).join('\n')}
`
        : ''
}
## Why Choose ${siteConfig.business.name}
${
    siteConfig.trustStats
        ? `
1. **${siteConfig.trustStats.accreditation ?? 'Board-Certified Surgeons'}**: Our surgeons hold certifications from both the American Board of Plastic Surgery and the American Board of Surgery
2. **${siteConfig.trustStats.patients} Procedures Performed**: Extensive experience in body contouring and cosmetic surgery
3. **${siteConfig.trustStats.rating}-Star Rating**: Consistently high patient satisfaction across review platforms
4. **Flexible Financing**: Multiple payment options including 0% APR plans through Cherry, CareCredit, and United Credit
5. **Bilingual Staff**: English and Spanish speaking team to serve our diverse patient base
6. **State-of-the-Art Facility**: AAASF-accredited surgical center in Miami`
        : `
1. **Board-Certified Surgeons**: Our surgeons hold certifications from leading medical boards
2. **Flexible Financing**: Multiple payment options including 0% APR plans
3. **Bilingual Staff**: English and Spanish speaking team
4. **State-of-the-Art Facility**: AAASF-accredited surgical center in Miami`
}

## Contact Information

**Address**: ${getFullAddress()}
**Phone**: ${siteConfig.contact.phoneDisplay ?? siteConfig.contact.phone}
**Email**: ${siteConfig.contact.email}

**Business Hours**:
${formatBusinessHours()}

**Serving**: South Florida (Miami, Fort Lauderdale, Coral Gables, Hialeah) and international patients from Latin America, Caribbean, and beyond.

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
            `# ${siteConfig.business.name}\n\n> ${siteConfig.business.description}\n\nVisit our website for more information.`,
            {
                status: 500,
                headers: {
                    'Content-Type': 'text/plain; charset=utf-8',
                },
            }
        )
    }
}

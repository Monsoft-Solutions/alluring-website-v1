/**
 * Comprehensive llms-full.txt Route Handler
 *
 * Generates a comprehensive content dump for AI crawlers
 * including all procedures, FAQs, and detailed information.
 *
 * This is the "full" version of llms.txt with more detail.
 */
import { NextResponse } from 'next/server'

import { procedures } from '@/lib/data/procedures.data'
import { siteConfig, getFullAddress } from '@/lib/data/site-config'
import { getPublishedPostCardsPage } from '@/lib/queries/blog/post-list.query'

/**
 * Generate comprehensive llms-full.txt content
 */
async function generateLlmsFullTxt(): Promise<string> {
    // Fetch recent blog posts
    let recentPosts: Array<{
        title: string
        slug: string
        excerpt: string | null
    }> = []
    try {
        const { items } = await getPublishedPostCardsPage({ limit: 20 })
        recentPosts = items.map((post) => ({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
        }))
    } catch {
        // Blog posts fetch failed, continue without them
    }

    const content = `# ${siteConfig.business.name} - Comprehensive Information Guide

> ${siteConfig.business.description}

This is the comprehensive information file for ${siteConfig.business.name}, a premier plastic surgery clinic in Miami, Florida. This document provides detailed information about our procedures, surgeons, and services for AI assistants and language models.

---

## Business Overview

**Name**: ${siteConfig.business.name}${
        siteConfig.business.legalName
            ? `
**Legal Name**: ${siteConfig.business.legalName}`
            : ''
    }${
        siteConfig.business.organizationType
            ? `
**Type**: ${siteConfig.business.organizationType}`
            : ''
    }${
        siteConfig.business.tagline
            ? `
**Tagline**: "${siteConfig.business.tagline}"`
            : ''
    }

**Location**: ${getFullAddress()}${
        siteConfig.contact.coordinates
            ? `
**Coordinates**: ${siteConfig.contact.coordinates.lat}, ${siteConfig.contact.coordinates.lng}`
            : ''
    }
**Phone**: ${siteConfig.contact.phoneDisplay ?? siteConfig.contact.phone}
**Email**: ${siteConfig.contact.email}${
        siteConfig.contact.timezone
            ? `
**Timezone**: ${siteConfig.contact.timezone}`
            : ''
    }
${
    siteConfig.trustStats
        ? `
### Trust & Credentials${
              siteConfig.trustStats.accreditation
                  ? `
- **Accreditation**: ${siteConfig.trustStats.accreditation}`
                  : ''
          }
- **Procedures Performed**: ${siteConfig.trustStats.patients}
- **Years in Practice**: ${siteConfig.trustStats.years}
- **Patient Rating**: ${siteConfig.trustStats.rating}/5 stars
- **Board Certification**: ${siteConfig.trustStats.certified}`
        : ''
}
${
    siteConfig.contact.businessHours &&
    siteConfig.contact.businessHours.length > 0
        ? `
### Business Hours
${siteConfig.contact.businessHours.map((h) => `- ${h.days}: ${h.open === 'Closed' ? 'Closed' : `${h.open} - ${h.close}`}${h.note ? ` (${h.note})` : ''}`).join('\n')}`
        : ''
}

---

## Procedures Offered

${procedures
    .map(
        (p) => `### ${p.title}

**URL**: /procedures/${p.slug}
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

## Patient Resources

### Consultation
- **Free Consultation**: /free-consultation
- No-obligation consultations available with our board-certified surgeons
- Virtual consultations available for out-of-town patients

### Financing Options
- **URL**: /plastic-surgery-financing-miami
- **Partners**: Cherry, CareCredit, United Credit
- 0% APR financing plans available
- Flexible payment schedules
- Instant approval process

### Before & After Gallery
- **URL**: /gallery
- Real patient results
- Categorized by procedure type
- High-resolution images

### Educational Blog
- **URL**: /blog
- Expert plastic surgery guides
- Recovery tips and advice
- Procedure comparisons
- Patient stories

${
    recentPosts.length > 0
        ? `### Recent Articles
${recentPosts.map((post) => `- [${post.title}](/blog/${post.slug})`).join('\n')}
`
        : ''
}

---

## Why Choose ${siteConfig.business.name}

1. **Double Board-Certified Surgeons**: Our surgeons hold certifications from both the American Board of Plastic Surgery and the American Board of Surgery, demonstrating the highest level of training and expertise.
${
    siteConfig.trustStats
        ? `
2. **Extensive Experience**: With ${siteConfig.trustStats.patients} procedures performed, our surgical team has the experience necessary to deliver exceptional results.

3. **Patient-Centered Care**: Our ${siteConfig.trustStats.rating}-star rating reflects our commitment to patient satisfaction and care throughout the entire surgical journey.
`
        : ''
}
4. **Affordable Luxury**: We believe everyone deserves access to quality cosmetic surgery. Our flexible financing options make procedures accessible.

5. **Bilingual Services**: Our English and Spanish speaking staff ensures clear communication with our diverse patient base.

6. **Accredited Facility**: Our AAASF-accredited surgical center meets the highest standards for safety and quality.

7. **Miami Location**: Located in the heart of Miami, we serve patients from South Florida and around the world.

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

**Medical Tourism**: We welcome patients from:
- Latin America (Brazil, Colombia, Venezuela, Mexico)
- Caribbean Islands
- Other US states
- International destinations

---

## Contact & Social

**Phone**: ${siteConfig.contact.phoneDisplay ?? siteConfig.contact.phone}
**Email**: ${siteConfig.contact.email}
**Address**: ${getFullAddress()}

**Social Media**:
${siteConfig.social.map((s) => `- ${s.label ?? s.platform}: ${s.url}`).join('\n')}

---

## Legal

- [Privacy Policy](/privacy)
- [Terms of Service](/terms)
- [Sitemap](/sitemap.xml)

---

*Last updated: ${new Date().toISOString().split('T')[0]}*
*This content is generated dynamically from ${siteConfig.business.name} website data.*
`

    return content
}

export async function GET() {
    try {
        const content = await generateLlmsFullTxt()

        return new NextResponse(content, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'public, max-age=3600, s-maxage=86400',
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

/**
 * Shared SEO helpers for the procedure pages.
 *
 * Server-only: the procedure catalog it serves must never reach the client
 * bundle (issue #210).
 *
 * @module
 */
import type { JsonLdGraphNode } from '@workspace/seo/react'

import type { Procedure } from '@/lib/types/procedure.type'

/** `http://…`, `https://…` or a protocol-relative `//…`. */
const ABSOLUTE_URL = /^(https?:)?\/\//i

/**
 * Resolve an image or asset reference against the site origin.
 *
 * Procedure images come from two places — `/images/...` paths under `public`
 * and absolute Vercel Blob URLs — and callers used to write
 * `` `${siteUrl}${procedure.image}` `` for both. For the blob-hosted ones that
 * produced `https://www.alluringplasticsurgery.comhttps//izzy….blob…`, which
 * is what three of the nine procedure pages served as their `og:image` and in
 * every JSON-LD `image` field (#250).
 *
 * @param reference - A path or an already-absolute URL. `undefined` passes through.
 * @param siteUrl - The site origin, with no trailing slash.
 * @returns An absolute URL, or `undefined` when there is nothing to resolve.
 */
export function toAbsoluteUrl(
    reference: string | undefined | null,
    siteUrl: string
): string | undefined {
    if (!reference) return undefined
    if (ABSOLUTE_URL.test(reference)) return reference

    const origin = siteUrl.replace(/\/+$/, '')
    const path = reference.startsWith('/') ? reference : `/${reference}`

    return `${origin}${path}`
}

/**
 * The procedure's share image, falling back to the site default.
 *
 * Every `og:image`, `twitter:images` and JSON-LD `image` on a procedure page
 * goes through here, so the three of them can never disagree.
 */
export function procedureImageUrl(
    procedure: Pick<Procedure, 'image'>,
    siteUrl: string
): string {
    return (
        toAbsoluteUrl(procedure.image, siteUrl) ??
        `${siteUrl.replace(/\/+$/, '')}/og-image.jpg`
    )
}

/**
 * Where on the body the procedure is performed, for
 * `SurgicalProcedure.bodyLocation`.
 *
 * Reads the procedure's own `bodyLocation` when it has one and only then falls
 * back to the category. The category fallback is coarse by nature — it mapped
 * every `body` procedure to "abdomen", so the BBL page claimed the abdomen
 * (#250) — so it answers `undefined` for `body` and `combined` rather than
 * guessing. An omitted field is better structured data than a wrong one.
 */
export function procedureBodyLocation(
    procedure: Pick<Procedure, 'bodyLocation' | 'category'>
): string | undefined {
    if (procedure.bodyLocation) return procedure.bodyLocation

    switch (procedure.category) {
        case 'face':
            return 'face'
        case 'breast':
            return 'breast'
        default:
            return undefined
    }
}

/**
 * Every node a procedure page publishes, as one `@graph`.
 *
 * The page used to emit six standalone JSON-LD blocks plus a Review block per
 * Google review and an ImageObject per related card — 26 to 28 scripts, each
 * repeating `@context`, each describing the business again, and none of them
 * saying that the `SurgicalProcedure`, the `Service` and the `WebPage` are the
 * same subject (#250). Here they are one graph with stable `@id`s, so the
 * relationships are explicit and the business is named once by reference to
 * the site-wide `#organization` node that the root layout already publishes.
 *
 * `#255` consumes this: a per-procedure module supplies the nodes, this
 * assembles them.
 */
export function buildProcedureGraph({
    procedure,
    pageUrl,
    siteUrl,
    faqs,
    breadcrumbs,
    offer,
}: {
    procedure: Procedure
    pageUrl: string
    siteUrl: string
    faqs?: { question: string; answer: string }[]
    breadcrumbs: { name: string; item: string }[]
    offer?: JsonLdGraphNode | false | null
}): JsonLdGraphNode[] {
    const organizationId = `${siteUrl}/#organization`
    const webPageId = `${pageUrl}#webpage`
    const breadcrumbId = `${pageUrl}#breadcrumb`
    const procedureId = `${pageUrl}#procedure`
    const image = procedureImageUrl(procedure, siteUrl)

    const webPage = {
        '@type': 'MedicalWebPage',
        '@id': webPageId,
        name: procedure.title,
        url: pageUrl,
        description: procedure.description,
        publisher: { '@id': organizationId },
        primaryImageOfPage: image,
        breadcrumb: { '@id': breadcrumbId },
        mainEntity: { '@id': procedureId },
        speakable: {
            '@type': 'SpeakableSpecification',
            cssSelector: ['h1', '.procedure-intro', '.quick-answer'],
        },
        // Omitted when unknown. It used to fall back to the request date,
        // which made every crawl look like a fresh edit.
        ...(procedure.dateModified && { dateModified: procedure.dateModified }),
        ...(procedure.datePublished && {
            datePublished: procedure.datePublished,
        }),
    }

    const breadcrumbList = {
        '@type': 'BreadcrumbList',
        '@id': breadcrumbId,
        itemListElement: breadcrumbs.map((crumb, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.name,
            item: crumb.item,
        })),
    }

    const faqPage = faqs?.length
        ? {
              '@type': 'FAQPage',
              '@id': `${pageUrl}#faq`,
              mainEntityOfPage: { '@id': webPageId },
              mainEntity: faqs.map((faq) => ({
                  '@type': 'Question',
                  name: faq.question,
                  acceptedAnswer: { '@type': 'Answer', text: faq.answer },
              })),
          }
        : undefined

    const surgicalProcedure = {
        '@type': 'SurgicalProcedure',
        '@id': procedureId,
        name: procedure.title,
        description: procedure.description,
        url: pageUrl,
        mainEntityOfPage: { '@id': webPageId },
        image,
        procedureType: 'https://schema.org/SurgicalProcedure',
        performedBy: { '@id': organizationId },
        ...(procedureBodyLocation(procedure) && {
            bodyLocation: procedureBodyLocation(procedure),
        }),
        ...(procedure.process?.length && {
            howPerformed: procedure.process
                .map((step) => `${step.title}: ${step.description}`)
                .join('. '),
        }),
        ...(procedure.quickStats?.recovery && {
            followup: `Recovery time: ${procedure.quickStats.recovery}`,
        }),
    }

    const service = {
        '@type': 'Service',
        '@id': `${pageUrl}#service`,
        name: `${procedure.title} in Miami`,
        description: procedure.description,
        url: pageUrl,
        serviceType: 'Cosmetic Surgery',
        provider: { '@id': organizationId },
        // The practice serves the United States. Not Latin America, not the
        // Caribbean — see CLAUDE.md.
        areaServed: ['Miami', 'Florida', 'United States'],
        availableLanguage: ['English', 'Spanish'],
        image,
        ...(procedure.pricing && {
            offers: {
                '@type': 'Offer',
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
                url: pageUrl,
                priceSpecification: {
                    '@type': 'PriceSpecification',
                    priceCurrency: 'USD',
                    minPrice: procedure.pricing.startingAt,
                    ...(procedure.pricing.upTo && {
                        maxPrice: procedure.pricing.upTo,
                    }),
                },
            },
        }),
    }

    return [
        webPage,
        breadcrumbList,
        faqPage,
        surgicalProcedure,
        service,
        offer || undefined,
    ].filter((node): node is JsonLdGraphNode => Boolean(node))
}

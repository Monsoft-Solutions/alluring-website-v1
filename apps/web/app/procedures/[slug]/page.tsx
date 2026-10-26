import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { JsonLdGraph } from '@workspace/seo/react'

import { resolveProcedureClaims } from '@/lib/claims/resolve-claims.server'
import { procedures, getProcedureBySlug } from '@/lib/data/procedures.data'
import { siteConfig } from '@/lib/data/site-config'
import { KARLINSKY_NAME } from '@/lib/data/surgeons/karlinsky-credentials.constant'
import { getProcedurePrices } from '@/lib/queries/pricing.query'
import { getActivePromotionByProcedure } from '@/lib/queries/promotion.query'
import {
    getProcedureSurgeonNode,
    renderProcedurePage,
} from '@/lib/procedures/procedure-page-registry'
import { fitResolvedTitle } from '@/lib/seo/fit-title.util'
import { generateProcedureTitle } from '@/lib/seo/generate-title.util'
import {
    buildProcedureGraph,
    procedureImageUrl,
    toAbsoluteUrl,
} from '@/lib/seo/procedure-graph.util'
import { toProcedureSummary } from '@/lib/data/procedure-summary.util'
import { clampMetaDescription } from '@/lib/seo/meta-description.util'
import { env } from '@/env'

interface ProcedurePageProps {
    params: Promise<{
        slug: string
    }>
}

export function generateStaticParams() {
    return procedures.map((procedure) => ({
        slug: procedure.slug,
    }))
}

/**
 * The meta description for a procedure page nobody has written one for. It
 * states only what the claims canon verifies (issue #354): one surgeon,
 * financing, real photos. No volume, tenure or superlative.
 */
function generateProcedureDescription(procedureTitle: string): string {
    return `${procedureTitle} in Miami, performed by one surgeon: ${KARLINSKY_NAME}. Financing available. See real before and after photos and book a consultation.`
}

/**
 * The procedure with its claim tokens resolved (`[[price:…]]` in its copy),
 * so the metadata, the graph and the page body print the same prices.
 */
async function getResolvedProcedure(slug: string) {
    const procedure = getProcedureBySlug(slug)
    return procedure ? resolveProcedureClaims(procedure) : undefined
}

export async function generateMetadata(
    props: ProcedurePageProps
): Promise<Metadata> {
    const params = await props.params
    const procedure = await getResolvedProcedure(params.slug)

    if (!procedure) {
        return {
            title: 'Procedure Not Found',
        }
    }

    const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? siteConfig.seo.siteUrl
    const pageUrl = `${siteUrl}/procedures/${params.slug}`
    const ogImage = procedureImageUrl(procedure, siteUrl)

    // A hand-written title always wins. The generated pattern is a floor for
    // pages nobody has written metadata for, not something to override an
    // author who picked the head term deliberately. A hand-written title can
    // name prices (#354); a discount that pushes it past the limit drops its
    // "(N% off $X)" suffixes, and the generated title takes over only if it
    // still does not fit.
    const generatedTitle = generateProcedureTitle(procedure.title)
    const pageTitle = procedure.seoTitle
        ? fitResolvedTitle(procedure.seoTitle, generatedTitle)
        : generatedTitle

    // Same for the description. Clamping still applies either way — it is a
    // safety net against overrun, and a hand-written one under the limit
    // passes through untouched.
    const metaDescription = clampMetaDescription(
        procedure.metaDescription ??
            generateProcedureDescription(procedure.title)
    )

    return {
        title: pageTitle,
        description: metaDescription,
        keywords: procedure.keywords,

        // Canonical URL
        alternates: {
            canonical: pageUrl,
        },

        // Open Graph tags for social sharing (Facebook, LinkedIn, etc.)
        openGraph: {
            type: 'website',
            url: pageUrl,
            title: pageTitle,
            description: metaDescription,
            siteName: siteConfig.business.name,
            locale: 'en_US',
            // No width or height: the procedure images come in several
            // sizes, and declaring 1200×630 for all of them was wrong for
            // most. Every title already ends in "Miami".
            images: [
                {
                    url: ogImage,
                    alt: `${procedure.title} - ${siteConfig.business.name}`,
                },
            ],
        },

        // Twitter Card tags
        twitter: {
            card: 'summary_large_image',
            title: pageTitle,
            description: metaDescription,
            images: [ogImage],
        },

        // Robots directives
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
    }
}

export default async function ProcedurePage(props: ProcedurePageProps) {
    const params = await props.params
    const procedure = await getResolvedProcedure(params.slug)

    if (!procedure) {
        notFound()
    }

    // Every price on the page, and the graph's Offers, from the resolver.
    const prices = await getProcedurePrices(params.slug)

    const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? siteConfig.seo.siteUrl
    const pageUrl = `${siteUrl}/procedures/${params.slug}`

    // Related procedures, projected to what the card renders. The cards are
    // client components, so whatever they receive is serialized into the RSC
    // payload — passing whole procedures put three other procedures' markdown
    // and FAQs on this page (#250).
    const relatedProcedures = (
        await Promise.all(
            procedures
                .filter(
                    (p) =>
                        p.category === procedure.category &&
                        p.slug !== procedure.slug
                )
                .slice(0, 3)
                .map(resolveProcedureClaims)
        )
    ).map(toProcedureSummary)

    // Fetch related promotion for this procedure (for structured data)
    const relatedPromotion = await getActivePromotionByProcedure(params.slug)

    // The promotion, as a graph node. `offeredBy` is a reference rather than a
    // second copy of the business's address and phone number.
    const promotionOfferNode = relatedPromotion && {
        '@type': 'Offer' as const,
        '@id': `${siteUrl}/promotions/${relatedPromotion.slug}#offer`,
        name: relatedPromotion.title,
        description:
            relatedPromotion.excerpt ??
            relatedPromotion.description ??
            undefined,
        url: `${siteUrl}/promotions/${relatedPromotion.slug}`,
        availability: 'https://schema.org/LimitedAvailability',
        category: relatedPromotion.type ?? undefined,
        offeredBy: { '@id': `${siteUrl}/#organization` },
        // The Service, not the SurgicalProcedure: `itemOffered` takes a
        // Product or Service, and a MedicalProcedure is neither.
        itemOffered: { '@id': `${pageUrl}#service` },
        ...(relatedPromotion.startsAt && {
            validFrom: new Date(relatedPromotion.startsAt).toISOString(),
        }),
        ...(relatedPromotion.endsAt && {
            validThrough: new Date(relatedPromotion.endsAt).toISOString(),
            priceValidUntil: new Date(relatedPromotion.endsAt).toISOString(),
        }),
        ...(relatedPromotion.imageUrl && {
            image: toAbsoluteUrl(relatedPromotion.imageUrl, siteUrl),
        }),
    }

    // Breadcrumb items for schema
    const breadcrumbItems = [
        { name: 'Home', item: siteUrl },
        { name: 'Procedures', item: `${siteUrl}/procedures` },
        { name: procedure.title, item: pageUrl },
    ]

    return (
        <>
            {/* One structured-data graph, not one script per entity. The
                nodes reference each other and the site-wide #organization by
                @id, so the page describes a single subject (#250, #255). */}
            <JsonLdGraph
                nodes={buildProcedureGraph({
                    procedure,
                    pageUrl,
                    siteUrl,
                    faqs: procedure.faqs,
                    breadcrumbs: breadcrumbItems,
                    offer: promotionOfferNode,
                    surgeon: getProcedureSurgeonNode(procedure.slug, siteUrl),
                    prices,
                })}
            />

            {/* The page body. Most procedures share the template; one with
                a layout of its own registers a module (#255). */}
            {renderProcedurePage({
                procedure,
                relatedProcedures,
                siteUrl,
                pageUrl,
                prices,
            })}
        </>
    )
}

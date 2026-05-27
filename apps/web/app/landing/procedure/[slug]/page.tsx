/**
 * Procedure Landing Page — `/landing/procedure/[slug]`
 *
 * Tailored, conversion-only landing page for procedure-specific paid
 * traffic (Meta, Google, IG bio links pointing at one procedure). The
 * URL slug matches the canonical procedure data file (e.g.
 * `breast-augmentation-miami`) so every variant reuses the same source
 * of truth as `/procedures/[slug]` without forking copy.
 *
 * Why a separate page from `/procedures/[slug]`:
 *   - This page strips the site nav so there's only ONE path forward:
 *     the lead form. Lives under `/landing/*` so STANDALONE_ROUTES
 *     auto-removes the global header/footer and exit-intent popup.
 *   - Content is intentionally lighter than the canonical SEO page —
 *     no full markdown body, no blog posts, no related-procedure grid.
 *     Every section drives back to the hero form.
 *   - Lead source = `LANDING_PAGE`, with the procedure name on the
 *     submission subject so attribution lands cleanly in the CRM.
 *
 * Robots: `noindex` — paid traffic should never compete with the
 * canonical `/procedures/[slug]` page in organic search.
 */
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
    BreadcrumbSchema,
    FAQSchema,
    MedicalProcedureSchema,
    ServiceSchema,
    WebPageSchema,
} from '@workspace/seo/react'

import { ContainerLayout } from '@/components/container-layout.component'
import { ProcedureLandingBenefits } from '@/components/procedure-landing/procedure-landing-benefits.component'
import { ProcedureLandingHero } from '@/components/procedure-landing/procedure-landing-hero.component'
import { ProcedureLandingMidCTA } from '@/components/procedure-landing/procedure-landing-mid-cta.component'
import { ProcedureLandingMinimalFooter } from '@/components/procedure-landing/procedure-landing-minimal-footer.component'
import { ProcedureLandingMinimalHeader } from '@/components/procedure-landing/procedure-landing-minimal-header.component'
import { ProcedureLandingPromo } from '@/components/procedure-landing/procedure-landing-promo.component'
import { ProcedureLandingStatsStrip } from '@/components/procedure-landing/procedure-landing-stats-strip.component'
import { ProcedureLandingStickyMobileCTA } from '@/components/procedure-landing/procedure-landing-sticky-mobile-cta.component'
import { CTASection } from '@/components/shared/cta-section.component'
import { FAQComponent } from '@/components/shared/faq.component'
import { GoogleReviews } from '@/components/shared/google-reviews.component'
import { ProcedureBeforeAfterSection } from '@/components/shared/procedure-before-after-section.component'
import { WeeklyPayments } from '@/components/shared/weekly-payments.component'
import { env } from '@/env'
import { getProcedureBySlug, procedures } from '@/lib/data/procedures.data'
import { siteConfig } from '@/lib/data/site-config'
import { getActivePromotionByProcedure } from '@/lib/queries/promotion.query'
import { seoConfig } from '@/lib/seo-config'
import type { ProcedureFAQ } from '@/lib/types/procedure.type'

const HERO_FORM_ANCHOR = '#hero-form'

/**
 * Strips pricing-related FAQs from the landing page.
 *
 * This LP is intentionally pricing-free — the goal is to capture leads
 * with a custom quote, not to publish a price list that competes with
 * the consultation conversation. We drop any FAQ whose question or
 * answer references cost, price, financing, or dollar amounts.
 */
const PRICING_TERMS = [
    'cost',
    'price',
    'pricing',
    'how much',
    'financing',
    'afford',
    'expensive',
    'cheap',
    'weekly payment',
    'pay for',
    '$',
] as const

function isPricingFaq(faq: ProcedureFAQ): boolean {
    const haystack = `${faq.question} ${faq.answer}`.toLowerCase()
    return PRICING_TERMS.some((term) => haystack.includes(term))
}

function filterOutPricing(
    faqs: readonly ProcedureFAQ[] | undefined
): ProcedureFAQ[] {
    if (!faqs) return []
    return faqs.filter((faq) => !isPricingFaq(faq))
}

interface ProcedureLandingPageProps {
    params: Promise<{
        slug: string
    }>
}

export function generateStaticParams() {
    return procedures.map((procedure) => ({
        slug: procedure.slug,
    }))
}

export async function generateMetadata(
    props: ProcedureLandingPageProps
): Promise<Metadata> {
    const params = await props.params
    const procedure = getProcedureBySlug(params.slug)

    if (!procedure) {
        return { title: 'Procedure Not Found' }
    }

    const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? seoConfig.siteUrl
    const pagePath = `/landing/procedure/${params.slug}`
    const pageUrl = `${siteUrl}${pagePath}`
    const cleanTitle = procedure.title.replace(/\s*Miami\s*$/i, '')

    const ogImage = procedure.image
        ? `${siteUrl}${procedure.image}`
        : `${siteUrl}/og-image.jpg`

    const title = `Get Your ${cleanTitle} Quote · Free Consult · Miami`
    const description = `Free ${cleanTitle.toLowerCase()} quote in Miami. Board-certified surgeons, honest pricing, financing available. We'll text you within 24 hours — no pressure.`

    return {
        title,
        description,

        // Paid LP — keep out of organic search so it never competes
        // with the canonical /procedures/[slug] page.
        robots: {
            index: false,
            follow: false,
            googleBot: {
                index: false,
                follow: false,
            },
        },

        alternates: {
            canonical: pageUrl,
        },

        openGraph: {
            type: 'website',
            url: pageUrl,
            title,
            description,
            siteName: siteConfig.business.name,
            locale: 'en_US',
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: `${procedure.title} · ${siteConfig.business.name}`,
                },
            ],
        },

        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [ogImage],
        },
    }
}

export default async function ProcedureLandingPage(
    props: ProcedureLandingPageProps
) {
    const params = await props.params
    const procedure = getProcedureBySlug(params.slug)

    if (!procedure) {
        notFound()
    }

    const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? seoConfig.siteUrl
    const pageUrl = `${siteUrl}/landing/procedure/${params.slug}`

    // Procedure-targeted promotion (null if none active) — drives the
    // promotion section directly under the hero.
    const promotion = await getActivePromotionByProcedure(params.slug)

    // FAQ list with pricing-related entries removed
    const visibleFaqs = filterOutPricing(procedure.faqs)

    const faqSchemaItems = visibleFaqs.map((faq) => ({
        question: faq.question,
        answer: faq.answer,
    }))

    const breadcrumbItems = [
        { name: 'Home', item: siteUrl },
        { name: procedure.title, item: pageUrl },
    ]

    return (
        <>
            {/* Schemas — kept narrow vs. canonical /procedures/[slug] */}
            <WebPageSchema
                name={procedure.title}
                url={pageUrl}
                description={procedure.description}
                dateModified={
                    procedure.dateModified || new Date().toISOString()
                }
            />

            <BreadcrumbSchema items={breadcrumbItems} />

            {faqSchemaItems.length > 0 && <FAQSchema items={faqSchemaItems} />}

            <MedicalProcedureSchema
                name={procedure.title}
                description={procedure.description}
                url={pageUrl}
                image={
                    procedure.image
                        ? `${siteUrl}${procedure.image}`
                        : `${siteUrl}/og-image.jpg`
                }
                bodyLocation={
                    procedure.category === 'face'
                        ? 'face'
                        : procedure.category === 'breast'
                          ? 'breast'
                          : procedure.category === 'body'
                            ? 'abdomen'
                            : undefined
                }
                procedureType='Surgical'
                schemaType='SurgicalProcedure'
                dateModified={procedure.dateModified ?? undefined}
                datePublished={procedure.datePublished ?? undefined}
                performedBy={{
                    '@id': `${siteUrl}/#organization`,
                    name: siteConfig.business.name,
                    type: 'MedicalBusiness',
                }}
            />

            <ServiceSchema
                name={`${procedure.title} Consultation`}
                description={`Free ${procedure.title.toLowerCase()} consultation with board-certified Miami surgeons. Honest pricing, financing available.`}
                url={pageUrl}
                serviceType='Cosmetic Surgery Consultation'
                provider={{
                    '@id': `${siteUrl}/#organization`,
                    name: siteConfig.business.name,
                    type: 'MedicalBusiness',
                }}
                areaServed={['Miami', 'Florida', 'Latin America', 'Caribbean']}
                availableLanguage={['English', 'Spanish']}
                offers={{
                    price: 0,
                    priceCurrency: 'USD',
                    availability: 'InStock',
                    url: pageUrl,
                }}
                image={
                    procedure.image
                        ? `${siteUrl}${procedure.image}`
                        : `${siteUrl}/og-image.jpg`
                }
            />

            {/* Stripped chrome — only one path forward */}
            <ProcedureLandingMinimalHeader formAnchor={HERO_FORM_ANCHOR} />

            <ContainerLayout as='main' noPaddingTop noPadding size='full'>
                {/* Hero — form-first conversion */}
                <ProcedureLandingHero id='hero' procedure={procedure} />

                {/* Procedure-targeted promotion — only when one is
                    active. Sits directly under the hero so the strongest
                    incentive lands before scroll fatigue sets in. */}
                {promotion && (
                    <ProcedureLandingPromo
                        promotion={promotion}
                        formAnchor={HERO_FORM_ANCHOR}
                    />
                )}

                {/* Social proof — Google reviews. Placement depends on
                    whether a promotion runs: with a promo, reviews
                    immediately validate the offer; without one, reviews
                    sit after the "honest answers" stats strip so the
                    procedure facts land before the testimonials. */}
                {promotion && (
                    <GoogleReviews
                        title={`What ${procedure.title.replace(/\s*Miami\s*$/i, '')} patients say`}
                        subtitle='Verified Google reviews'
                        limit={3}
                        showGoogleLink={false}
                        showViewAllButton={false}
                        includeSchema={false}
                    />
                )}

                {/* Reassurance strip ("The honest answers") */}
                {procedure.quickStats && (
                    <ProcedureLandingStatsStrip stats={procedure.quickStats} />
                )}

                {!promotion && (
                    <GoogleReviews
                        title={`What ${procedure.title.replace(/\s*Miami\s*$/i, '')} patients say`}
                        subtitle='Verified Google reviews'
                        limit={3}
                        showGoogleLink={false}
                        showViewAllButton={false}
                        includeSchema={false}
                    />
                )}

                {/* Why patients choose this procedure */}
                {procedure.benefits && (
                    <ProcedureLandingBenefits
                        benefits={procedure.benefits}
                        formAnchor={HERO_FORM_ANCHOR}
                    />
                )}

                {/* Real patient results — server component, gracefully
                    renders nothing if no pairs exist for the slug */}
                <ProcedureBeforeAfterSection
                    procedureSlug={params.slug}
                    procedureTitle={procedure.title}
                />

                {/* Mid-page conversion punch */}
                <ProcedureLandingMidCTA
                    procedureTitle={procedure.title}
                    formAnchor={HERO_FORM_ANCHOR}
                />

                {/* Financing — addresses the #1 objection */}
                <WeeklyPayments id='financing' formAnchor={HERO_FORM_ANCHOR} />

                {/* Honest answers — pricing FAQs are filtered out
                    because this LP captures leads with a custom quote
                    rather than publishing a price list */}
                {visibleFaqs.length > 0 && (
                    <FAQComponent
                        faqs={visibleFaqs}
                        title='Honest answers to common questions'
                        variant='muted'
                        includeSchema={false}
                    />
                )}

                {/* Final luxury CTA */}
                <CTASection
                    id='final-cta'
                    variant='luxury'
                    eyebrow='Take the first step'
                    heading="Let's plan yours."
                    description='Free quote. Honest plan. No pressure — just answers, when you’re ready.'
                    primaryButton={{
                        text: 'Get My Free Quote',
                        href: HERO_FORM_ANCHOR,
                    }}
                    size='lg'
                />
            </ContainerLayout>

            <ProcedureLandingMinimalFooter />

            {/* Mobile-only sticky booking bar */}
            <ProcedureLandingStickyMobileCTA
                formAnchor={HERO_FORM_ANCHOR}
                heroFormId='hero-form'
            />
        </>
    )
}

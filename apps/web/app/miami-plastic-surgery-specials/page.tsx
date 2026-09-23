/**
 * Miami Plastic Surgery Specials Page
 *
 * Conversion-optimized landing page showcasing current promotions and deals.
 * Features hero with consultation form, urgency elements, and trust indicators.
 *
 * SEO-optimized for:
 * - "miami plastic surgery specials"
 * - "cosmetic surgery deals"
 * - "promotional offers"
 */
import type { Metadata } from 'next'

import {
    BreadcrumbSchema,
    FAQSchema,
    OfferCatalogSchema,
    WebPageSchema,
} from '@workspace/seo/react'

import { SectionViewTracker } from '@/components/analytics/section-view-tracker.component'
import { ContainerLayout } from '@/components/container-layout.component'
import { LeadSteps } from '@/components/sections/lead-page/lead-steps.component'
import { ResumeChatCta } from '@/components/sections/lead-page/resume-chat-cta.component'
import {
    SPECIALS_CHAT_ID,
    SpecialsChatHero,
    type SpecialsOffer,
} from '@/components/sections/specials/specials-chat-hero.component'
import { SpecialsOfferTerms } from '@/components/sections/specials/specials-offer-terms.component'
import { SpecialsPromotionsGrid } from '@/components/sections/specials/specials-promotions-grid.component'
import { ConsultStickyBar } from '@/components/shared/consult-chat/consult-sticky-bar.component'
import { FAQComponent } from '@/components/shared/faq.component'
import { GalleryCarousel } from '@/components/shared/gallery-carousel.component'
import { GoogleReviews } from '@/components/shared/google-reviews.component'
import { specialsFaqData } from '@/lib/data/faq/specials-faq.data'
import { siteConfig } from '@/lib/data/site-config'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'
import { getSpecialsFeaturedGalleryImages } from '@/lib/queries/gallery/specials-gallery.query'
import { getActivePromotions } from '@/lib/queries/promotion.query'

/**
 * Generate dynamic month/year for specials page title
 * Ensures freshness signals in search results
 */
function getCurrentMonthYear(): string {
    const now = new Date()
    const month = now.toLocaleString('en-US', { month: 'long' })
    const year = now.getFullYear()
    return `${month} ${year}`
}

/**
 * Specials Page Metadata
 *
 * SEO-optimized metadata including:
 * - Dynamic month/year for freshness signals
 * - Urgency elements for CTR
 * - Trust signals and clear value proposition
 */
const monthYear = getCurrentMonthYear()
const pageTitle = `Miami Plastic Surgery Specials ${monthYear} | Alluring`

/**
 * Generate dynamic metadata with featured promotion's OG image
 */
export async function generateMetadata(): Promise<Metadata> {
    const promotions = await getActivePromotions(1)
    const featuredPromotion = promotions[0]

    const ogImage = featuredPromotion?.imageUrl
        ? {
              url: featuredPromotion.imageUrl,
              width: 1200,
              height: 630,
              alt:
                  featuredPromotion.imageAlt ??
                  `${featuredPromotion.title} - ${siteConfig.business.name}`,
          }
        : {
              url: `${seoConfig.siteUrl}/og-image.jpg`,
              width: 1200,
              height: 630,
              alt: `Plastic Surgery Specials - ${siteConfig.business.name} Miami`,
          }

    return toNextMetadata(seoConfig, {
        canonical: '/miami-plastic-surgery-specials',
        title: pageTitle,
        description:
            'Current specials on BBL, breast augmentation, mommy makeover & more at Alluring Plastic Surgery in Miami. Free consultation, your price in writing, financing available.',

        openGraph: {
            title: pageTitle,
            description:
                'Current specials on BBL, breast augmentation, mommy makeover & more at Alluring Plastic Surgery in Miami. Free consultation, your price in writing, financing available.',
            url: `${seoConfig.siteUrl}/miami-plastic-surgery-specials`,
            type: 'website',
            siteName: seoConfig.siteName,
            images: [ogImage],
        },

        twitter: {
            card: 'summary_large_image',
            title: pageTitle,
            description:
                'Current specials on BBL, breast augmentation, mommy makeover & more in Miami. Free consultation, your price in writing.',
            images: [ogImage.url],
        },
    })
}

/** "September 30", in Miami time. */
function formatEndsOn(endsAt: Date | null): string | null {
    if (!endsAt) return null
    return new Date(endsAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        timeZone: siteConfig.contact.timezone,
    })
}

/** Splits "September Sign & Save — Up to 20% Off" into its name and headline. */
function toOffer(
    promo: Awaited<ReturnType<typeof getActivePromotions>>[number]
): SpecialsOffer {
    const [name, ...rest] = promo.title.split(/\s+[—–-]\s+/)
    const headline = rest.join(' — ').trim()
    return {
        title: promo.title,
        name: (name ?? promo.title).trim(),
        headline: headline || promo.title,
        endsOn: formatEndsOn(promo.endsAt),
        slug: promo.slug,
    }
}

export default async function MiamiPlasticSurgerySpecialsPage() {
    const [promotions, galleryImages] = await Promise.all([
        getActivePromotions(),
        getSpecialsFeaturedGalleryImages(),
    ])

    const featured = promotions[0] ?? null
    const offer = featured ? toOffer(featured) : null

    return (
        <>
            {/* SEO Schema - WebPage */}
            <WebPageSchema
                name={`Plastic Surgery Specials & Deals - ${siteConfig.business.name} Miami`}
                url={`${seoConfig.siteUrl}/miami-plastic-surgery-specials`}
                description='Current plastic surgery specials in Miami on BBL, breast augmentation, tummy tuck, liposuction and more. Free consultation and a personalized quote in writing.'
            />

            {/* SEO Schema - Breadcrumb */}
            <BreadcrumbSchema
                items={[
                    { name: 'Home', item: seoConfig.siteUrl },
                    {
                        name: 'Miami Plastic Surgery Specials',
                        item: `${seoConfig.siteUrl}/miami-plastic-surgery-specials`,
                    },
                ]}
            />

            {/* SEO Schema - FAQ */}
            <FAQSchema
                items={specialsFaqData.map((faq) => ({
                    question: faq.question,
                    answer: faq.answer,
                }))}
            />

            <OfferCatalogSchema
                name={`Miami Plastic Surgery Specials - ${monthYear}`}
                url={`${seoConfig.siteUrl}/miami-plastic-surgery-specials`}
                description='Current plastic surgery specials in Miami on BBL, breast augmentation, tummy tuck, liposuction and more.'
                numberOfItems={promotions.length}
                offeredBy={{
                    '@id': `${seoConfig.siteUrl}/#organization`,
                    type: 'MedicalBusiness',
                    name: siteConfig.business.name,
                    url: seoConfig.siteUrl,
                }}
                itemListElement={promotions.map((promo) => ({
                    name: promo.title,
                    url: `${seoConfig.siteUrl}/promotions/${promo.slug}`,
                    description: promo.excerpt ?? promo.description,
                    validThrough: promo.endsAt
                        ? new Date(promo.endsAt).toISOString()
                        : undefined,
                    image: promo.imageUrl ?? undefined,
                    category: promo.type,
                }))}
            />

            {/*
                One ask, the consultation thread (#274). The thread sits on the
                first screen; everything after it is short proof, and every
                CTA leads back to it with the visitor's answers kept.
            */}
            <ContainerLayout as='div' noPaddingTop noPadding size='full'>
                <SpecialsChatHero offer={offer} monthYear={monthYear} />

                {featured && offer && (
                    <SpecialsOfferTerms
                        chatId={SPECIALS_CHAT_ID}
                        title={featured.title}
                        terms={featured.excerpt}
                        endsOn={offer.endsOn}
                        slug={featured.slug}
                    />
                )}

                <GoogleReviews
                    title='What Our Patients Say'
                    subtitle='Real reviews from patients who trusted us with their transformation'
                    limit={3}
                />

                <GalleryCarousel id='gallery-results' images={galleryImages} />

                <LeadSteps />

                {promotions.length > 1 && (
                    <SpecialsPromotionsGrid
                        id='all-specials'
                        promotions={promotions}
                    />
                )}

                <FAQComponent
                    id='faq'
                    faqs={specialsFaqData}
                    title='Questions About Our Specials'
                    description='Everything you need to know about claiming an offer at Alluring Plastic Surgery.'
                    variant='muted'
                    includeSchema={false}
                />

                <ResumeChatCta
                    chatId={SPECIALS_CHAT_ID}
                    eyebrow={
                        offer?.endsOn
                            ? `Ends ${offer.endsOn}`
                            : 'Free consultation'
                    }
                    heading='Pick up where you left off'
                    body='Your answers are saved in the thread at the top of the page. Four questions, under a minute, and a patient coordinator takes it from there.'
                    buttonLabel='Finish my request'
                />
            </ContainerLayout>

            <ConsultStickyBar
                chatId={SPECIALS_CHAT_ID}
                label={{ en: 'Claim the offer', es: 'Pedir la oferta' }}
                phoneDigits={siteConfig.contact.phone.replace(/\D/g, '')}
                phoneLabel={`Call ${siteConfig.contact.phoneDisplay}`}
            />

            <SectionViewTracker />
        </>
    )
}

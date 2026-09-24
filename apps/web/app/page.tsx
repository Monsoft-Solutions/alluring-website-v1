import type { Metadata } from 'next'
import {
    BreadcrumbSchema,
    FAQSchema,
    JsonLdGraph,
    MedicalClinicSchema,
    OfferSchema,
    VideoObjectSchema,
    WebPageSchema,
} from '@workspace/seo/react'

// First, and it brings the page's stylesheet: see fonts.tsx for why the
// order keeps the home fonts from being preloaded on other routes.
import { HomeFontScope } from '@/components/home-page/fonts'
import { SectionViewTracker } from '@/components/analytics/section-view-tracker.component'
import { HomeClose } from '@/components/home-page/home-close.component'
import { HomeConsult } from '@/components/home-page/home-consult.component'
import { HomeFaq } from '@/components/home-page/home-faq.component'
import { HomeFlyIn } from '@/components/home-page/home-fly-in.component'
import { HomeHero } from '@/components/home-page/home-hero.component'
import {
    HOME_CHAT_ID,
    HOME_MEDIA,
} from '@/components/home-page/home-page.constant'
import { HomePrices } from '@/components/home-page/home-prices.component'
import { HomeProcedurePicker } from '@/components/home-page/home-procedure-picker.component'
import { HomeProofTicker } from '@/components/home-page/home-proof-ticker.component'
import { HomeResults } from '@/components/home-page/home-results.component'
import { HomeReviews } from '@/components/home-page/home-reviews.component'
import { HomeSurgeon } from '@/components/home-page/home-surgeon.component'
import { ModuleStarSprite } from '@/components/procedures/module-kit/module-stars.component'
import { ConsultStickyBar } from '@/components/shared/consult-chat/consult-sticky-bar.component'
import { env } from '@/env'
import { homePageFaqs } from '@/lib/data/faq/home-page-faqs.data'
import { bblFigure } from '@/lib/data/procedures/facts/bbl.facts'
import { lipoFigure } from '@/lib/data/procedures/facts/lipo.facts'
import { getSmsLink, siteConfig } from '@/lib/data/site-config'
import { KARLINSKY_NAME } from '@/lib/data/surgeons/karlinsky-credentials.constant'
import { getSpecialsFeaturedGalleryImages } from '@/lib/queries/gallery/specials-gallery.query'
import {
    formatDiscount,
    getFeaturedPromotion,
} from '@/lib/queries/promotion.query'
import { getPublishedGoogleReviews } from '@/lib/queries/reviews/google-reviews.query'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'
import { karlinskyPersonNode } from '@/lib/seo/surgeon-graph.util'

const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? siteConfig.seo.siteUrl

/**
 * The home page is found by its name: nearly every search click it earns is
 * a brand query, and the brand queries it loses are "alluring plastic
 * surgery reviews" and "… photos". So the title answers those — prices,
 * reviews, results — after the name. No surgeon name in the title (a
 * staffing change would break it); the description names her, as an MD.
 */
const title = 'Alluring Plastic Surgery Miami | Real Prices, Reviews & Results'
const description = `Lipo 360 from ${lipoFigure('price-starting-at')} and BBL from ${bblFigure('price-starting-at')}, by ${KARLINSKY_NAME}. Financing, Google reviews and a free consult in Miami or by video.`

export const metadata: Metadata = toNextMetadata(seoConfig, {
    canonical: '/',
    title,
    description,
    openGraph: {
        type: 'website',
        url: siteUrl,
        title,
        description,
        siteName: siteConfig.business.name,
        locale: 'en_US',
        images: [
            {
                url: `${siteUrl}/og-image.jpg`,
                width: 1200,
                height: 630,
                alt: `${siteConfig.business.name}, Miami`,
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [`${siteUrl}/og-image.jpg`],
    },
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
})

/**
 * Home page, rebuilt around the visitor it actually gets: someone who has
 * seen the practice on social media or heard of it, searched its name, and
 * came to check it out, usually on a phone, usually from another state,
 * often after hours.
 *
 * The old page was 28,000 px tall on a phone and 42% of phone visitors left
 * within its first 1,400 px, so everything they came to verify now sits in
 * the first few screens: the first question of the consultation thread in the
 * hero, a proof ribbon, the thread itself, then results, the surgeon, prices
 * and the fly-in plan. One conversion path runs through it all, the
 * consultation thread, and every CTA jumps to it.
 */
export default async function Page() {
    const [featuredPromotion, reviewsResult, galleryImages] = await Promise.all(
        [
            getFeaturedPromotion(),
            getPublishedGoogleReviews(14),
            getSpecialsFeaturedGalleryImages(),
        ]
    )
    const { reviews, averageRating, totalCount } = reviewsResult

    return (
        <>
            <WebPageSchema
                name={`${siteConfig.business.name} | ${siteConfig.business.tagline}`}
                url={siteUrl}
                description={description}
                speakable={{
                    cssSelector: ['h1', '#faq summary'],
                }}
            />

            <BreadcrumbSchema items={[{ name: 'Home', item: siteUrl }]} />

            <VideoObjectSchema
                name='Alluring Plastic Surgery, Miami'
                description='A short lifestyle film on a sunlit terrace in Miami. Model shown; not a patient.'
                thumbnailUrl={HOME_MEDIA.heroPosterDesktop}
                uploadDate='2026-09-24'
                contentUrl={HOME_MEDIA.heroVideoDesktop}
                author={{
                    type: 'Organization',
                    name: siteConfig.business.name,
                    url: siteUrl,
                }}
            />

            <MedicalClinicSchema
                name={siteConfig.business.name}
                id={`${siteUrl}/#organization`}
                url={siteUrl}
                logo={`${siteUrl}${siteConfig.brand.logo}`}
                telephone={siteConfig.contact.phone}
                address={{
                    streetAddress: siteConfig.contact.address,
                    addressLocality: siteConfig.contact.city,
                    addressRegion: siteConfig.contact.state,
                    postalCode: siteConfig.contact.postalCode,
                    addressCountry: 'US',
                }}
                geo={{
                    latitude: siteConfig.contact.coordinates?.lat ?? 25.7529,
                    longitude: siteConfig.contact.coordinates?.lng ?? -80.3309,
                }}
                openingHoursSpecification={[
                    {
                        dayOfWeek: [
                            'Monday',
                            'Tuesday',
                            'Wednesday',
                            'Thursday',
                            'Friday',
                        ],
                        opens: '09:00',
                        closes: '17:00',
                    },
                    {
                        dayOfWeek: ['Saturday'],
                        opens: '09:00',
                        closes: '15:00',
                    },
                ]}
                image={`${siteUrl}/og-image.jpg`}
                medicalSpecialty={['PlasticSurgery']}
                isAcceptingNewPatients={true}
                priceRange='$$$'
                availableLanguage={['English', 'Spanish']}
                contactPoint={[
                    {
                        contactType: 'Appointments',
                        telephone: siteConfig.contact.phone,
                        availableLanguage: ['English', 'Spanish'],
                        areaServed: 'US',
                    },
                ]}
                sameAs={siteConfig.social.map((s) => s.url)}
                areaServed={['Miami, FL', 'South Florida', 'United States']}
                hasOfferCatalog={{
                    name: 'Cosmetic Surgery Procedures',
                    itemListElement: [
                        'Liposuction (Lipo 360)',
                        'Brazilian Butt Lift',
                        'Mommy Makeover',
                        'Tummy Tuck',
                        'Breast Augmentation',
                    ],
                }}
                {...(averageRating && totalCount > 0
                    ? {
                          aggregateRating: {
                              ratingValue: averageRating,
                              reviewCount: totalCount,
                              bestRating: 5,
                              worstRating: 1,
                          },
                      }
                    : {})}
            />

            {/* The surgeon, from the verified-credentials constant: the node
                the procedure pages publish, in place of the old "Double
                Board-Certified" Physician node. */}
            <JsonLdGraph nodes={[karlinskyPersonNode(siteUrl)]} />

            <FAQSchema
                items={homePageFaqs.map((faq) => ({
                    question: faq.question,
                    answer: faq.answer,
                }))}
            />

            {featuredPromotion && (
                <OfferSchema
                    name={featuredPromotion.title}
                    description={
                        featuredPromotion.excerpt ??
                        featuredPromotion.description
                    }
                    url={`${siteUrl}/promotions/${featuredPromotion.slug}`}
                    validFrom={
                        featuredPromotion.startsAt
                            ? new Date(featuredPromotion.startsAt).toISOString()
                            : undefined
                    }
                    validThrough={
                        featuredPromotion.endsAt
                            ? new Date(featuredPromotion.endsAt).toISOString()
                            : undefined
                    }
                    priceValidUntil={
                        featuredPromotion.endsAt
                            ? new Date(featuredPromotion.endsAt).toISOString()
                            : undefined
                    }
                    availability='LimitedAvailability'
                    category={featuredPromotion.type}
                    image={featuredPromotion.imageUrl ?? undefined}
                    discount={formatDiscount(featuredPromotion) ?? undefined}
                    offeredBy={{
                        '@id': `${siteUrl}/#organization`,
                        type: 'MedicalBusiness',
                        name: siteConfig.business.name,
                        url: siteUrl,
                    }}
                />
            )}

            <HomeFontScope />
            <div className='hp-page'>
                <ModuleStarSprite />
                <HomeHero rating={averageRating} reviewCount={totalCount} />
                <HomeProofTicker
                    rating={averageRating}
                    reviewCount={totalCount}
                    reviews={reviews}
                />
                <HomeConsult />
                <HomeResults images={galleryImages} />
                <HomeProcedurePicker />
                <HomeSurgeon />
                <HomePrices
                    promotion={
                        featuredPromotion
                            ? {
                                  title: featuredPromotion.title,
                                  href: `/promotions/${featuredPromotion.slug}`,
                              }
                            : null
                    }
                />
                <HomeFlyIn />
                <HomeReviews
                    reviews={reviews}
                    rating={averageRating}
                    reviewCount={totalCount}
                />
                <HomeFaq />
                <HomeClose />
            </div>

            <ConsultStickyBar
                chatId={HOME_CHAT_ID}
                label={{
                    en: 'Start my free consultation',
                    es: 'Empezar mi consulta gratis',
                }}
                phoneDigits={siteConfig.contact.phone.replace(/\D/g, '')}
                phoneLabel={`Call ${siteConfig.contact.phoneDisplay ?? siteConfig.contact.phone}`}
                smsLink={getSmsLink()}
            />

            <SectionViewTracker />
        </>
    )
}

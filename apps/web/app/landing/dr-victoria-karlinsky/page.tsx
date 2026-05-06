/**
 * Dr. Victoria Karlinsky — Lead Conversion Landing Page
 *
 * Optimized for warm Instagram-bio-link traffic. The visitor already
 * follows Dr. Karlinsky on IG, so the page leads with results and gives
 * them one decisive booking path — not a credentials wall.
 *
 * URL: /landing/dr-victoria-karlinsky
 * Lives under /landing/* so the global header/footer are auto-stripped via
 * STANDALONE_ROUTES, and so future ad LPs share the same namespace and
 * chrome treatment. Distinct from /dr-karlinsky (the canonical bio page)
 * so paid traffic and organic discovery stay separate.
 *
 * Entry point for IG: `/dr-karlinsky-ig` (308 redirect appends UTMs).
 */
import {
    FAQSchema,
    PhysicianSchema,
    ServiceSchema,
    WebPageSchema,
} from '@workspace/seo/react'

import { ContainerLayout } from '@/components/container-layout.component'
import { DrKarlinskyHero } from '@/components/dr-karlinsky-landing/dr-karlinsky-hero.component'
import { DrKarlinskyMinimalFooter } from '@/components/dr-karlinsky-landing/dr-karlinsky-minimal-footer.component'
import { DrKarlinskyMinimalHeader } from '@/components/dr-karlinsky-landing/dr-karlinsky-minimal-header.component'
import { DrKarlinskySpecialties } from '@/components/dr-karlinsky-landing/dr-karlinsky-specialties.component'
import { DrKarlinskyStickyMobileCTA } from '@/components/dr-karlinsky-landing/dr-karlinsky-sticky-mobile-cta.component'
import { CTASection } from '@/components/shared/cta-section.component'
import { CategorizedFAQ } from '@/components/shared/faq-categorized.component'
import { GalleryCarousel } from '@/components/shared/gallery-carousel.component'
import { GoogleReviews } from '@/components/shared/google-reviews.component'
import { WeeklyPayments } from '@/components/shared/weekly-payments.component'
import {
    drKarlinskyFaqCategories,
    drKarlinskyFaqConfig,
    drKarlinskyFaqData,
} from '@/lib/data/faq/dr-karlinsky-faq.data'
import { siteConfig } from '@/lib/data/site-config'
import { surgeons } from '@/lib/data/surgeons/surgeons-data'
import { getSpecialsFeaturedGalleryImages } from '@/lib/queries/gallery/specials-gallery.query'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'

const HERO_FORM_ANCHOR = '#hero-form'
const PAGE_PATH = '/landing/dr-victoria-karlinsky'
const PAGE_URL = `${seoConfig.siteUrl}${PAGE_PATH}`

export const metadata = toNextMetadata(seoConfig, {
    canonical: PAGE_PATH,
    title: 'Book With Dr. Karlinsky · Triple Board-Certified Miami Surgeon',
    description:
        "Free consult with Dr. Victoria Karlinsky — triple board-certified Miami cosmetic surgeon. BBL, mommy makeover, tummy tuck, breast & facial surgery. Financing from $27/week. We'll text you within 24 hours.",

    openGraph: {
        title: 'Book With Dr. Karlinsky · Triple Board-Certified Miami Surgeon',
        description:
            "Free consult with Dr. Victoria Karlinsky in Miami. Triple board-certified. Financing available. We'll text you within 24 hours.",
        url: PAGE_URL,
        type: 'profile',
        siteName: seoConfig.siteName,
        images: [
            {
                url: `${seoConfig.siteUrl}/og-image.jpg`,
                width: 1200,
                height: 630,
                alt: `Dr. Victoria Karlinsky - ${siteConfig.business.name} Miami`,
            },
        ],
    },

    twitter: {
        card: 'summary_large_image',
        title: 'Book With Dr. Karlinsky · Miami Cosmetic Surgeon',
        description:
            'Triple board-certified. Free consult. Booking this month — virtual or in-person.',
        images: [`${seoConfig.siteUrl}/og-image.jpg`],
    },

    alternates: {
        canonical: PAGE_PATH,
    },
})

export default async function DrVictoriaKarlinskyLandingPage() {
    const surgeon = surgeons[0]
    const galleryImages = await getSpecialsFeaturedGalleryImages()

    const allFaqItems = Object.values(drKarlinskyFaqData).flat()
    const faqSchemaItems = allFaqItems.map((faq) => ({
        question: faq.question,
        answer: faq.answer,
    }))

    const sameAsLinks = surgeon
        ? [
              ...Object.values(surgeon.social ?? {}).filter((v): v is string =>
                  Boolean(v)
              ),
              ...Object.values(surgeon.externalProfiles ?? {}).filter(
                  (v): v is string => Boolean(v)
              ),
          ]
        : []

    return (
        <>
            {/* Page schema */}
            <WebPageSchema
                name={`Dr. Victoria Karlinsky - ${siteConfig.business.name}`}
                url={PAGE_URL}
                description='Book a complimentary consultation with Dr. Victoria Karlinsky, triple board-certified cosmetic surgeon at Alluring Plastic Surgery Miami.'
            />

            <FAQSchema items={faqSchemaItems} />

            <ServiceSchema
                name='Cosmetic Surgery Consultation with Dr. Victoria Karlinsky'
                description='Complimentary, no-obligation consultation with triple board-certified cosmetic surgeon Dr. Victoria Karlinsky. Discuss BBL, mommy makeover, tummy tuck, breast surgery, facelift, and more.'
                url={PAGE_URL}
                serviceType='Cosmetic Surgery Consultation'
                provider={{
                    '@id': `${seoConfig.siteUrl}/#organization`,
                    name: siteConfig.business.name,
                    url: seoConfig.siteUrl,
                    type: 'MedicalBusiness',
                    logo: seoConfig.organization?.logo,
                }}
                areaServed={['Miami', 'Florida', 'Latin America', 'Caribbean']}
                availableLanguage={['English', 'Spanish']}
                offers={{
                    price: 0,
                    priceCurrency: 'USD',
                    availability: 'InStock',
                    url: PAGE_URL,
                }}
                image={`${seoConfig.siteUrl}/og-image.jpg`}
            />

            {/* Physician schema (E-E-A-T) */}
            {surgeon && (
                <PhysicianSchema
                    id={`${seoConfig.siteUrl}/#physician-${surgeon.slug}`}
                    name={surgeon.name}
                    url={PAGE_URL}
                    image={
                        surgeon.images.featured.startsWith('http')
                            ? surgeon.images.featured
                            : `${seoConfig.siteUrl}${surgeon.images.featured}`
                    }
                    description={surgeon.fullBio}
                    jobTitle={surgeon.title}
                    medicalSpecialty={surgeon.specialties}
                    award={surgeon.certifications}
                    alumniOf={surgeon.education.map((edu) => ({ name: edu }))}
                    worksFor={{
                        '@id': `${seoConfig.siteUrl}/#organization`,
                        name: siteConfig.business.name,
                        url: seoConfig.siteUrl,
                        address: {
                            streetAddress: siteConfig.contact.address,
                            addressLocality: siteConfig.contact.city,
                            addressRegion: siteConfig.contact.state,
                            postalCode: siteConfig.contact.postalCode,
                            addressCountry: siteConfig.contact.country,
                        },
                    }}
                    address={{
                        streetAddress: siteConfig.contact.address,
                        addressLocality: siteConfig.contact.city,
                        addressRegion: siteConfig.contact.state,
                        postalCode: siteConfig.contact.postalCode,
                        addressCountry: siteConfig.contact.country,
                    }}
                    telephone={siteConfig.contact.phone}
                    sameAs={sameAsLinks}
                    knowsAbout={surgeon.specialties}
                />
            )}

            {/* Stripped chrome — no nav exits, just logo + phone + book CTA */}
            <DrKarlinskyMinimalHeader formAnchor={HERO_FORM_ANCHOR} />

            {/* Page content — IG-warm flow: hero → results → voices →
                procedures → answers → financing → final CTA */}
            <ContainerLayout as='main' noPaddingTop noPadding size='full'>
                <DrKarlinskyHero id='hero' />

                <GalleryCarousel id='gallery' images={galleryImages} />

                <GoogleReviews
                    title='Patients on Dr. Karlinsky'
                    subtitle='Verified Google reviews'
                    limit={3}
                    showGoogleLink={false}
                    showViewAllButton={false}
                    includeSchema={false}
                />

                <DrKarlinskySpecialties
                    id='specialties'
                    formAnchor={HERO_FORM_ANCHOR}
                />

                <CategorizedFAQ
                    id='faq'
                    categories={drKarlinskyFaqCategories}
                    faqData={drKarlinskyFaqData}
                    badge={drKarlinskyFaqConfig.badge}
                    title={drKarlinskyFaqConfig.title}
                    subtitle={drKarlinskyFaqConfig.subtitle}
                    description={drKarlinskyFaqConfig.description}
                    variant='default'
                    showBackgroundDecoration={true}
                    includeSchema={false}
                />

                <WeeklyPayments id='financing' formAnchor={HERO_FORM_ANCHOR} />

                <CTASection
                    id='final-cta'
                    variant='luxury'
                    eyebrow='Take the First Step'
                    heading="Let's plan yours."
                    description='Free consult. Honest plan. No pressure — just answers, when you’re ready.'
                    primaryButton={{
                        text: 'Book My Free Consultation',
                        href: HERO_FORM_ANCHOR,
                    }}
                    size='lg'
                />
            </ContainerLayout>

            <DrKarlinskyMinimalFooter />

            {/* Mobile-only sticky booking bar — hides while hero form is on screen */}
            <DrKarlinskyStickyMobileCTA
                formAnchor={HERO_FORM_ANCHOR}
                heroFormId='hero-form'
            />
        </>
    )
}

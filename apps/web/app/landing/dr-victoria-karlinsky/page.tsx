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
    JsonLdGraph,
    ServiceSchema,
    WebPageSchema,
} from '@workspace/seo/react'
import { AREA_SERVED } from '@workspace/shared/claims/identity'

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
import { FinancingSection } from '@/components/shared/financing-section.component'
import {
    drKarlinskyFaqCategories,
    drKarlinskyFaqConfig,
    drKarlinskyFaqData,
} from '@/lib/data/faq/dr-karlinsky-faq.data'
import { resolveClaimsIn } from '@/lib/claims/resolve-claims.server'
import { siteConfig } from '@/lib/data/site-config'
import { karlinskyPersonNode } from '@/lib/seo/surgeon-graph.util'
import { getSpecialsFeaturedGalleryImages } from '@/lib/queries/gallery/specials-gallery.query'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'

const HERO_FORM_ANCHOR = '#hero-form'
const PAGE_PATH = '/landing/dr-victoria-karlinsky'
const PAGE_URL = `${seoConfig.siteUrl}${PAGE_PATH}`

export const metadata = toNextMetadata(seoConfig, {
    canonical: PAGE_PATH,
    // No surgeon name or board count in a title, no payment figure and no
    // response-time promise (claims canon §2, §6, §9; #354).
    title: 'Book a Consultation · One Miami Cosmetic Surgeon',
    description:
        'Free consult with Victoria Karlinsky, MD, FACS, a cosmetic surgeon in Miami. BBL, mommy makeover, tummy tuck, breast & facial surgery. Financing available.',

    openGraph: {
        title: 'Book a Consultation · One Miami Cosmetic Surgeon',
        description:
            'Free consult with Victoria Karlinsky, MD, FACS, in Miami. Financing available.',
        url: PAGE_URL,
        type: 'profile',
        siteName: seoConfig.siteName,
        images: [
            {
                url: `${PAGE_PATH}/opengraph-image`,
                width: 1200,
                height: 630,
                alt: `Victoria Karlinsky, MD, FACS - ${siteConfig.business.name} Miami`,
            },
        ],
    },

    twitter: {
        card: 'summary_large_image',
        title: 'Book a Consultation · Miami Cosmetic Surgeon',
        description:
            'Free consult with Victoria Karlinsky, MD, FACS, virtual or in person.',
        images: [`${PAGE_PATH}/opengraph-image`],
    },

    alternates: {
        canonical: PAGE_PATH,
    },
})

export default async function DrVictoriaKarlinskyLandingPage() {
    const [galleryImages, faqData] = await Promise.all([
        getSpecialsFeaturedGalleryImages(),
        // Claim tokens in the answers (prices, financing; #354), resolved
        // once for both the visible list and its schema.
        resolveClaimsIn(
            drKarlinskyFaqData,
            'text',
            'faq /landing/dr-victoria-karlinsky'
        ),
    ])

    const allFaqItems = Object.values(faqData).flat()
    const faqSchemaItems = allFaqItems.map((faq) => ({
        question: faq.question,
        answer: faq.answer,
    }))

    return (
        <>
            {/* Page schema */}
            <WebPageSchema
                name={`Victoria Karlinsky, MD, FACS - ${siteConfig.business.name}`}
                url={PAGE_URL}
                description='Book a complimentary consultation with Victoria Karlinsky, MD, FACS, a cosmetic surgeon at Alluring Plastic Surgery in Miami.'
            />

            <FAQSchema items={faqSchemaItems} />

            <ServiceSchema
                name='Cosmetic Surgery Consultation with Victoria Karlinsky, MD, FACS'
                description='Complimentary, no-obligation consultation with Victoria Karlinsky, MD, FACS, a Miami cosmetic surgeon board certified in general surgery by the American Board of Surgery. Discuss BBL, mommy makeover, tummy tuck, breast surgery, facelift, and more.'
                url={PAGE_URL}
                serviceType='Cosmetic Surgery Consultation'
                provider={{
                    '@id': `${seoConfig.siteUrl}/#organization`,
                    name: siteConfig.business.name,
                    url: seoConfig.siteUrl,
                    type: 'MedicalBusiness',
                    logo: seoConfig.organization?.logo,
                }}
                // US only (claims canon §1, §8): the shared list every page uses.
                areaServed={[...AREA_SERVED]}
                availableLanguage={['English', 'Spanish']}
                offers={{
                    price: 0,
                    priceCurrency: 'USD',
                    availability: 'InStock',
                    url: PAGE_URL,
                }}
                image={`${seoConfig.siteUrl}/og-image.jpg`}
            />

            {/* The surgeon, from the verified-credentials constant (claims
                canon §2, #354): the Person node the home and procedure pages
                publish. No award list (it carried the cosmetic boards, which
                need the Florida statement), no education (D9), no specialty. */}
            <JsonLdGraph nodes={[karlinskyPersonNode(seoConfig.siteUrl)]} />

            {/* Stripped chrome — no nav exits, just logo + phone + book CTA */}
            <DrKarlinskyMinimalHeader formAnchor={HERO_FORM_ANCHOR} />

            {/* Page content — IG-warm flow: hero → results → voices →
                procedures → answers → financing → final CTA */}
            <ContainerLayout as='main' noPaddingTop noPadding size='full'>
                <DrKarlinskyHero id='hero' />

                <GalleryCarousel id='gallery' images={galleryImages} />

                <GoogleReviews
                    title='What Our Patients Say'
                    subtitle='Real reviews from our patients on Google'
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
                    faqData={faqData}
                    badge={drKarlinskyFaqConfig.badge}
                    title={drKarlinskyFaqConfig.title}
                    subtitle={drKarlinskyFaqConfig.subtitle}
                    description={drKarlinskyFaqConfig.description}
                    variant='default'
                    showBackgroundDecoration={true}
                    includeSchema={false}
                />

                <FinancingSection
                    id='financing'
                    formAnchor={HERO_FORM_ANCHOR}
                />

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

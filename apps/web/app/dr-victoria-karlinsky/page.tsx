/**
 * Dr. Victoria Karlinsky — Lead Conversion Landing Page
 *
 * Dedicated landing page for paid ad traffic targeting Dr. Karlinsky's name
 * and high-intent organic searches. Conversion-optimized: every section drives
 * toward the hero ConsultationForm (#hero-form).
 *
 * URL: /dr-victoria-karlinsky
 * Distinct from the existing /dr-karlinsky bio page (slug-based) so paid
 * traffic and organic discovery stay separate.
 */
import {
    FAQSchema,
    PhysicianSchema,
    ServiceSchema,
    WebPageSchema,
} from '@workspace/seo/react'

import { ContainerLayout } from '@/components/container-layout.component'
import { DrKarlinskyAbout } from '@/components/dr-karlinsky-landing/dr-karlinsky-about.component'
import { DrKarlinskyCredentialsWall } from '@/components/dr-karlinsky-landing/dr-karlinsky-credentials-wall.component'
import { DrKarlinskyHero } from '@/components/dr-karlinsky-landing/dr-karlinsky-hero.component'
import { DrKarlinskySpecialties } from '@/components/dr-karlinsky-landing/dr-karlinsky-specialties.component'
import { DrKarlinskyTrustStrip } from '@/components/dr-karlinsky-landing/dr-karlinsky-trust-strip.component'
import { DrKarlinskyWhyChoose } from '@/components/dr-karlinsky-landing/dr-karlinsky-why-choose.component'
import { ExitIntentPopup } from '@/components/home/exit-intent-popup.component'
import { MiniLeadCapture } from '@/components/landing/mini-lead-capture.component'
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
import { CONTACT_SOURCES } from '@/lib/types/forms/contact-form.type'

const HERO_FORM_ANCHOR = '#hero-form'
const PAGE_PATH = '/dr-victoria-karlinsky'
const PAGE_URL = `${seoConfig.siteUrl}${PAGE_PATH}`

export const metadata = toNextMetadata(seoConfig, {
    canonical: PAGE_PATH,
    title: 'Dr. Victoria Karlinsky | Triple Board-Certified Miami Surgeon',
    description:
        'Meet Dr. Victoria Karlinsky — triple board-certified cosmetic surgeon and FACS Fellow in Miami. BBL, mommy makeover, tummy tuck, breast & facial surgery. Free consult. Financing from $27/week.',

    openGraph: {
        title: 'Dr. Victoria Karlinsky | Triple Board-Certified Miami Surgeon',
        description:
            'Meet Dr. Victoria Karlinsky — triple board-certified cosmetic surgeon in Miami. Triple board-certified, FACS Fellow, fellowship director. Book your free consultation.',
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
        title: 'Dr. Victoria Karlinsky | Miami Cosmetic Surgeon',
        description:
            'Triple board-certified. FACS Fellow. Now booking complimentary consultations in Miami.',
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

    const phoneTel = siteConfig.contact.phone.replace(/\D/g, '')

    return (
        <>
            {/* Page schema */}
            <WebPageSchema
                name={`Dr. Victoria Karlinsky - ${siteConfig.business.name}`}
                url={PAGE_URL}
                description='Meet Dr. Victoria Karlinsky, triple board-certified cosmetic surgeon at Alluring Plastic Surgery Miami. Book a complimentary consultation.'
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

            {/* Page content */}
            <ContainerLayout as='main' noPaddingTop noPadding size='full'>
                <DrKarlinskyHero id='hero' />

                <DrKarlinskyTrustStrip id='trust-strip' />

                <DrKarlinskyAbout
                    id='about-doctor'
                    formAnchor={HERO_FORM_ANCHOR}
                />

                <DrKarlinskyWhyChoose
                    id='why-dr-karlinsky'
                    formAnchor={HERO_FORM_ANCHOR}
                />

                <DrKarlinskySpecialties
                    id='specialties'
                    formAnchor={HERO_FORM_ANCHOR}
                />

                <MiniLeadCapture
                    id='mini-capture'
                    source={CONTACT_SOURCES.DR_KARLINSKY_LANDING}
                    analyticsFormName='dr_karlinsky_mini_capture'
                />

                <GalleryCarousel id='gallery' images={galleryImages} />

                <GoogleReviews
                    title='Patients on Dr. Karlinsky'
                    subtitle='Verified Google reviews from real patients'
                    limit={3}
                    includeSchema={false}
                />

                <DrKarlinskyCredentialsWall id='credentials' />

                <WeeklyPayments id='financing' formAnchor={HERO_FORM_ANCHOR} />

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
                    ctaConfig={{
                        title: 'Still have questions?',
                        description:
                            'Our patient concierge is happy to talk it through — no pressure, just honest answers.',
                        buttonText: 'Call Now',
                        phoneNumber: phoneTel,
                    }}
                />

                <CTASection
                    id='final-cta'
                    variant='luxury'
                    eyebrow='Take the First Step'
                    heading='Ready to meet Dr. Karlinsky?'
                    description='Triple board-certified. FACS Fellow. Fellowship Director. Now booking complimentary consultations in Miami — virtual or in-person.'
                    primaryButton={{
                        text: 'Book My Free Consultation',
                        href: HERO_FORM_ANCHOR,
                    }}
                    secondaryButton={{
                        text: `Call ${siteConfig.contact.phoneDisplay}`,
                        href: `tel:${phoneTel}`,
                    }}
                    size='lg'
                />
            </ContainerLayout>

            <ExitIntentPopup />
        </>
    )
}

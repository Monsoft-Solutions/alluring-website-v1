/**
 * Contact Page
 *
 * World-class contact page with immersive hero contact form, trust-building sections,
 * surgeon previews, testimonials, and categorized FAQ.
 *
 * Optimized for conversions with the contact form as the primary hero element.
 */
import {
    BreadcrumbSchema,
    FAQSchema,
    MedicalClinicSchema,
    ServiceSchema,
    WebPageSchema,
} from '@workspace/seo/react'

import { SectionViewTracker } from '@/components/analytics/section-view-tracker.component'
import { ContainerLayout } from '@/components/container-layout.component'
import {
    CONTACT_CHAT_ID,
    ContactChatHero,
} from '@/components/sections/contact/contact-chat-hero.component'
import { LeadSteps } from '@/components/sections/lead-page/lead-steps.component'
import { ResumeChatCta } from '@/components/sections/lead-page/resume-chat-cta.component'
import { ConsultStickyBar } from '@/components/shared/consult-chat/consult-sticky-bar.component'
import { FAQComponent } from '@/components/shared/faq.component'
import { GalleryCarousel } from '@/components/shared/gallery-carousel.component'
import { GoogleReviews } from '@/components/shared/google-reviews.component'
import { contactPageFaqs } from '@/lib/data/faq/contact-faq-data'
import { getSmsLink, siteConfig } from '@/lib/data/site-config'
import { getSpecialsFeaturedGalleryImages } from '@/lib/queries/gallery/specials-gallery.query'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'

/**
 * Contact Page Metadata
 *
 * SEO-optimized metadata for the contact page including:
 * - Action-oriented title with clear value proposition
 * - Compelling description with urgency and trust signals
 * - Open Graph tags for social sharing
 * - Twitter Card configuration
 * - Canonical URL
 */
const pageTitle = 'Contact Us | Free Consultation | Alluring Plastic Surgery'

export const metadata = toNextMetadata(seoConfig, {
    canonical: '/contact-us',
    title: pageTitle,
    description:
        'Book your free, private consultation at Alluring Plastic Surgery in Miami. Three quick answers, a text back within 24 hours, your price in writing. Call, visit or message us.',

    openGraph: {
        title: pageTitle,
        description:
            'Book your free, private consultation at Alluring Plastic Surgery in Miami. Three quick answers, a text back within 24 hours, your price in writing. Call, visit or message us.',
        url: `${seoConfig.siteUrl}/contact-us`,
        type: 'website',
        siteName: seoConfig.siteName,
        images: [
            {
                url: `${seoConfig.siteUrl}/og-image.jpg`,
                width: 1200,
                height: 630,
                alt: `Schedule Your Consultation - ${siteConfig.business.name} Miami`,
            },
        ],
    },

    twitter: {
        card: 'summary_large_image',
        title: pageTitle,
        description:
            'Book your free consultation at Alluring Plastic Surgery in Miami. A reply within 24 hours and your price in writing.',
        images: [`${seoConfig.siteUrl}/og-image.jpg`],
    },
})

export default async function ContactPage() {
    // Fetch gallery images for visual proof section
    const galleryImages = await getSpecialsFeaturedGalleryImages()

    return (
        <>
            {/* SEO Schema - WebPage */}
            <WebPageSchema
                name={`Schedule Your Consultation - ${siteConfig.business.name} Miami`}
                url={`${seoConfig.siteUrl}/contact-us`}
                description='Request your free, private consultation at Alluring Plastic Surgery in Miami, or call or visit the practice.'
            />

            {/* SEO Schema - Breadcrumb */}
            <BreadcrumbSchema
                items={[
                    { name: 'Home', item: seoConfig.siteUrl },
                    {
                        name: 'Contact Us',
                        item: `${seoConfig.siteUrl}/contact-us`,
                    },
                ]}
            />

            {/* MedicalBusiness Schema - Healthcare-specific LocalBusiness for local SEO */}
            <MedicalClinicSchema
                name={siteConfig.business.name}
                id={`${seoConfig.siteUrl}/#organization`}
                url={seoConfig.siteUrl}
                logo={`${seoConfig.siteUrl}${siteConfig.brand.logo}`}
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
                image={`${seoConfig.siteUrl}/og-image.jpg`}
                medicalSpecialty={['PlasticSurgery']}
                isAcceptingNewPatients={true}
                sameAs={siteConfig.social.map((s) => s.url)}
                availableLanguage={['English', 'Spanish']}
                priceRange='$$$'
            />

            {/* Service Schema - Free Consultation offering */}
            <ServiceSchema
                name='Free Plastic Surgery Consultation'
                description='Free consultation with Dr. Victoria Karlinsky, MD, FACS. Discuss your goals and options and receive a personalized quote in writing, with no obligation.'
                url={`${seoConfig.siteUrl}/contact-us`}
                serviceType='Cosmetic Surgery Consultation'
                provider={{
                    '@id': `${seoConfig.siteUrl}/#organization`,
                    name: siteConfig.business.name,
                    type: 'MedicalBusiness',
                }}
                areaServed={['Miami', 'Florida', 'United States']}
                availableLanguage={['English', 'Spanish']}
                offers={{
                    price: 0,
                    priceCurrency: 'USD',
                    availability: 'InStock',
                    url: `${seoConfig.siteUrl}/contact-us`,
                }}
                image={`${seoConfig.siteUrl}/og-image.jpg`}
            />

            <FAQSchema
                items={contactPageFaqs.map((faq) => ({
                    question: faq.question,
                    answer: faq.answer,
                }))}
            />

            {/*
                One ask, the consultation thread (#274), next to the phone
                number and the address for visitors who came for those.
            */}
            <ContainerLayout as='div' noPaddingTop noPadding size='full'>
                <ContactChatHero />

                <GoogleReviews
                    title='Verified Google Reviews'
                    subtitle='Real feedback from real patients'
                    limit={3}
                    includeSchema={false}
                />

                <LeadSteps />

                <GalleryCarousel id='gallery-results' images={galleryImages} />

                <FAQComponent
                    id='faq'
                    faqs={[...contactPageFaqs]}
                    title='Before You Visit'
                    description='Straight answers to what patients ask before their consultation.'
                    variant='muted'
                    includeSchema={false}
                />

                <ResumeChatCta
                    chatId={CONTACT_CHAT_ID}
                    eyebrow='Free consultation'
                    fresh={{
                        heading: 'Ready when you are',
                        body: 'Three questions, under a minute. A patient coordinator texts you within 24 hours to book your free consultation.',
                        buttonLabel: 'Start my request',
                    }}
                    resume={{
                        heading: 'Pick up where you left off',
                        body: 'Your answers are saved in the thread at the top of the page. Finish it in under a minute and a patient coordinator texts you within 24 hours.',
                        buttonLabel: 'Finish my request',
                    }}
                />
            </ContainerLayout>

            <ConsultStickyBar
                chatId={CONTACT_CHAT_ID}
                label={{
                    en: 'Request my free consultation',
                    es: 'Pedir mi consulta gratis',
                }}
                phoneDigits={siteConfig.contact.phone.replace(/\D/g, '')}
                phoneLabel={`Call ${siteConfig.contact.phoneDisplay ?? siteConfig.contact.phone}`}
                smsLink={getSmsLink()}
            />

            <SectionViewTracker />
        </>
    )
}

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
    MedicalClinicSchema,
    ServiceSchema,
    WebPageSchema,
} from '@workspace/seo/react'

import { ContainerLayout } from '@/components/container-layout.component'
import { ContactHeroForm } from '@/components/sections/contact/contact-hero-form.component'
import { ContactStatsStrip } from '@/components/sections/contact/contact-stats-strip.component'
import { SurgeonPreview } from '@/components/sections/contact/surgeon-preview.component'
import { ContactAlternative } from '@/components/sections/contact/contact-alternative.component'
import { CategorizedFAQ } from '@/components/shared/faq-categorized.component'
import { FearBusters } from '@/components/shared/fear-busters.component'
import { GalleryCarousel } from '@/components/shared/gallery-carousel.component'
import { GoogleReviews } from '@/components/shared/google-reviews.component'
import { MobileCallButton } from '@/components/shared/mobile-call-button.component'
import { WeeklyPayments } from '@/components/shared/weekly-payments.component'
import {
    faqCategoriesContact,
    faqDataContact,
} from '@/lib/data/faq/contact-faq-data'
import { siteConfig } from '@/lib/data/site-config'
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
        'Schedule your free, private consultation with board-certified plastic surgeons. Discuss goals, see options, get pricing. No obligation. Same-week appointments.',

    openGraph: {
        title: pageTitle,
        description:
            'Schedule your free, private consultation with board-certified plastic surgeons. Discuss goals, see options, get pricing. No obligation. Same-week appointments.',
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
            'Schedule your free consultation with board-certified plastic surgeons. Discuss goals, see options, get pricing. No obligation.',
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
                description='Request your private consultation with board-certified plastic surgeons in Miami. Discuss your goals, explore your options, and start your transformation journey.'
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
                description='Complimentary consultation with board-certified plastic surgeons. Discuss your goals, explore your options, and receive personalized recommendations with no obligation.'
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

            {/* Main Content - Conversion-Optimized Flow */}
            <ContainerLayout as='div' noPaddingTop noPadding size='full'>
                {/* Section 1: Hero Contact Form */}
                <ContactHeroForm id='contact-form' />

                {/* Section 2: Fear Busters - Address objections immediately */}
                <FearBusters id='fear-busters' formAnchor='#contact-form' />

                {/* Section 3: Weekly Payments - Reinforce affordability */}
                <WeeklyPayments
                    id='weekly-payments'
                    formAnchor='#contact-form'
                />

                {/* Section 4: Google Reviews - Real Google reviews for trust */}
                <GoogleReviews
                    title='Verified Google Reviews'
                    subtitle='Real feedback from real patients'
                    limit={3}
                    includeSchema={false}
                />

                {/* Section 6: Gallery Carousel - Visual proof of results */}
                <GalleryCarousel id='gallery-results' images={galleryImages} />

                {/* Section 6: Stats Strip */}
                <ContactStatsStrip id='stats' />

                {/* Section 7: Surgeon Preview */}
                <SurgeonPreview id='surgeons' />

                {/* Section 8: Categorized FAQ */}
                <CategorizedFAQ
                    id='faq'
                    categories={faqCategoriesContact}
                    faqData={faqDataContact}
                    badge='Common Questions'
                    title='Before You Visit,'
                    subtitle='Know This.'
                    description='We believe in complete transparency. Here are answers to the most common questions patients ask before their consultation.'
                    variant='default'
                    showBackgroundDecoration={true}
                    ctaConfig={{
                        title: 'Have a specific question?',
                        description: 'Our patient concierge is ready to help.',
                        buttonText: 'Call Now',
                        phoneNumber: siteConfig.contact.phone.replace(
                            /\D/g,
                            ''
                        ),
                    }}
                />

                {/* Section 9: Alternative Contact Methods */}
                <ContactAlternative id='location' />
            </ContainerLayout>

            {/* Mobile Call Button - Always visible on contact page for conversion optimization */}
            <MobileCallButton position='bottom-right' style='icon-only' />
        </>
    )
}

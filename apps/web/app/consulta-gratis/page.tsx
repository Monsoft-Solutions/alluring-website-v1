/**
 * Spanish Lead Generation Landing Page
 *
 * Full Spanish-language landing page targeting:
 * - Miami's Hispanic population (60%+)
 * - Medical tourists from Latin America and Caribbean
 *
 * URL: /consulta-gratis
 *
 * Key differentiators:
 * - 100% Spanish content
 * - Emphasizes bilingual staff and cultural understanding
 * - Addresses international patient concerns
 * - All procedures available with Spanish consultation
 *
 * SEO-optimized for:
 * - "cirugía plástica miami"
 * - "aumento de senos miami"
 * - "liposucción miami"
 * - "levantamiento de glúteos miami"
 */
import {
    FAQSchema,
    LocalBusinessSchema,
    OrganizationSchema,
    ServiceSchema,
    WebPageSchema,
} from '@workspace/seo/react'

import { ContainerLayout } from '@/components/container-layout.component'
import { SpanishHero } from '@/components/landing/spanish-hero.component'
import { FearBusters } from '@/components/shared/fear-busters.component'
import { WeeklyPayments } from '@/components/shared/weekly-payments.component'
import { GalleryCarousel } from '@/components/shared/gallery-carousel.component'
import { Testimonials } from '@/components/shared/testimonials.component'
import { CategorizedFAQ } from '@/components/shared/faq-categorized.component'
import { CTASection } from '@/components/shared/cta-section.component'
import { ExitIntentPopup } from '@/components/home/exit-intent-popup.component'
import { MiniLeadCapture } from '@/components/landing/mini-lead-capture.component'
import {
    spanishFaqCategories,
    spanishFaqData,
    spanishFaqConfig,
} from '@/lib/data/faq/spanish-faq.data'
import { siteConfig } from '@/lib/data/site-config'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'
import { getSpecialsFeaturedGalleryImages } from '@/lib/queries/gallery/specials-gallery.query'

// Spanish-language testimonials from Hispanic patients
const SPANISH_TESTIMONIALS = [
    {
        id: 'spanish-testimonial-1',
        quote: 'Desde la primera llamada me atendieron en español. Me sentí cómoda explicando exactamente lo que quería. El Dr. Karlinsky entendió perfectamente mi visión y los resultados superaron mis expectativas.',
        name: 'Gabriela M.',
        procedure: 'BBL',
        timeframe: 'Venezuela • 8 meses post-op',
        rating: 5,
    },
    {
        id: 'spanish-testimonial-2',
        quote: 'Viajé desde Colombia específicamente para mi cirugía en Alluring. El equipo me ayudó a coordinar todo—hotel, transporte, citas. Me sentí completamente cuidada, como si estuviera en casa.',
        name: 'Valentina R.',
        procedure: 'Mommy Makeover',
        timeframe: 'Colombia • 1 año post-op',
        rating: 5,
    },
    {
        id: 'spanish-testimonial-3',
        quote: 'Como residente de Miami, quería un cirujano que hablara mi idioma y entendiera la estética latina. Alluring fue la elección perfecta. Los resultados son naturales y hermosos.',
        name: 'Isabella C.',
        procedure: 'Aumento de Senos',
        timeframe: 'Miami • 6 meses post-op',
        rating: 5,
    },
]

/**
 * Spanish Landing Page Metadata
 *
 * SEO-optimized for Spanish-language plastic surgery searches.
 */
export const metadata = toNextMetadata(seoConfig, {
    canonical: '/consulta-gratis',
    title: 'Cirugía Plástica Miami | Consulta Gratis | Hablamos Español',
    description:
        'Cirugía plástica de clase mundial en Miami. Equipo 100% bilingüe. BBL, aumento de senos, liposucción, mommy makeover. Cirujanos certificados. Financiamiento desde $27/semana.',

    openGraph: {
        title: 'Cirugía Plástica Miami | Consulta Gratis | Hablamos Español',
        description:
            'Cirugía plástica de clase mundial en Miami. Equipo 100% bilingüe. BBL, aumento de senos, liposucción, mommy makeover. Cirujanos certificados.',
        url: `${seoConfig.siteUrl}/consulta-gratis`,
        type: 'website',
        siteName: seoConfig.siteName,
        locale: 'es_US',
        images: [
            {
                url: `${seoConfig.siteUrl}/og-image.jpg`,
                width: 1200,
                height: 630,
                alt: `Cirugía Plástica Miami - ${siteConfig.business.name}`,
            },
        ],
    },

    twitter: {
        card: 'summary_large_image',
        title: 'Cirugía Plástica Miami | Hablamos Español',
        description:
            'Cirugía plástica de clase mundial en Miami. Equipo 100% bilingüe. Financiamiento disponible. Consulta gratis.',
        images: [`${seoConfig.siteUrl}/og-image.jpg`],
    },

    alternates: {
        canonical: '/consulta-gratis',
        languages: {
            es: '/consulta-gratis',
            'en-US': '/free-consultation',
            'x-default': '/free-consultation',
        },
    },
})

export default async function ConsultaGratisPage() {
    // Fetch gallery images for the carousel
    const galleryImages = await getSpecialsFeaturedGalleryImages()

    // Flatten FAQ data for schema
    const allFaqItems = Object.values(spanishFaqData).flat()
    const faqSchemaItems = allFaqItems.map((faq) => ({
        question: faq.question,
        answer: faq.answer,
    }))

    return (
        <>
            {/* SEO Schema - Local Business for Spanish speakers */}
            <LocalBusinessSchema
                name={siteConfig.business.name}
                url={`${seoConfig.siteUrl}/consulta-gratis`}
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
                image={`${seoConfig.siteUrl}/og-image.jpg`}
            />

            <WebPageSchema
                name={`Cirugía Plástica Miami - ${siteConfig.business.name}`}
                url={`${seoConfig.siteUrl}/consulta-gratis`}
                description='Cirugía plástica de clase mundial en Miami con equipo 100% bilingüe. BBL, aumento de senos, liposucción, mommy makeover. Cirujanos certificados con 15+ años de experiencia.'
            />

            <OrganizationSchema
                name={seoConfig.siteName}
                url={seoConfig.siteUrl}
                logo={seoConfig.organization?.logo}
                sameAs={seoConfig.organization?.socialProfiles?.map(
                    (s) => s.url
                )}
            />

            <FAQSchema items={faqSchemaItems} />

            {/* Structured Data - Service Schema for consultation offering */}
            <ServiceSchema
                name='Consulta Gratis de Cirugía Plástica'
                description='Consulta gratuita y sin compromiso con cirujanos plásticos certificados. Discuta sus metas estéticas, explore opciones quirúrgicas y no quirúrgicas, y reciba recomendaciones personalizadas.'
                url={`${seoConfig.siteUrl}/consulta-gratis`}
                serviceType='Cosmetic Surgery Consultation'
                provider={{
                    name: siteConfig.business.name,
                    url: seoConfig.siteUrl,
                    type: 'Organization',
                    logo: seoConfig.organization?.logo,
                }}
                areaServed={['Miami', 'Florida', 'América Latina', 'Caribe']}
                availableLanguage={['Español', 'Inglés']}
                offers={{
                    price: 0,
                    priceCurrency: 'USD',
                    availability: 'InStock',
                    url: `${seoConfig.siteUrl}/consulta-gratis`,
                }}
                image={`${seoConfig.siteUrl}/og-image.jpg`}
            />

            {/* Main Content - Spanish-Focused Conversion Flow */}
            <ContainerLayout as='div' noPaddingTop noPadding size='full'>
                {/* Section 1: Spanish Hero */}
                <SpanishHero id='hero' />

                {/* Section 2: Fear Busters - Address objections */}
                <FearBusters id='fear-busters' formAnchor='#hero-form' />

                {/* Section 3: Weekly Payments - Financing options */}
                <WeeklyPayments id='financing' formAnchor='#hero-form' />

                {/* Section 4: Before/After Gallery */}
                <GalleryCarousel id='gallery' images={galleryImages} />

                {/* Section 5: Spanish Testimonials */}
                <Testimonials
                    id='testimonials'
                    formAnchor='#hero-form'
                    testimonials={SPANISH_TESTIMONIALS}
                />

                {/* Section 6: Spanish FAQ */}
                <CategorizedFAQ
                    id='faq'
                    categories={spanishFaqCategories}
                    faqData={spanishFaqData}
                    badge={spanishFaqConfig.badge}
                    title={spanishFaqConfig.title}
                    subtitle={spanishFaqConfig.subtitle}
                    description={spanishFaqConfig.description}
                    variant='default'
                    showBackgroundDecoration={true}
                    includeSchema={false}
                    ctaConfig={{
                        title: '¿Prefieres hablar con alguien?',
                        description:
                            'Nuestro equipo está listo para ayudarte. Hablamos español.',
                        buttonText: 'Llámanos Ahora',
                        phoneNumber: siteConfig.contact.phone.replace(
                            /\D/g,
                            ''
                        ),
                    }}
                />

                {/* Section 7: Mini Lead Capture */}
                <MiniLeadCapture id='mini-capture' />

                {/* Section 8: Final CTA - Spanish */}
                <CTASection
                    id='final-cta'
                    variant='luxury'
                    heading='Tu Transformación Te Espera'
                    description='Cirugía plástica de clase mundial con un equipo que habla tu idioma y entiende tu cultura. Agenda tu consulta gratuita hoy y da el primer paso hacia la mejor versión de ti.'
                    primaryButton={{
                        text: 'Sí, Quiero Mi Consulta Gratis',
                        href: '#hero-form',
                    }}
                    secondaryButton={{
                        text: 'Llamar Para Más Información',
                        href: `tel:${siteConfig.contact.phone.replace(/\D/g, '')}`,
                    }}
                    eyebrow='Hablamos Tu Idioma'
                    size='lg'
                    backgroundImage='/images/landing/spanish-cta-bg.png'
                />
            </ContainerLayout>

            {/* Exit Intent Popup */}
            <ExitIntentPopup />
        </>
    )
}

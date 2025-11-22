/**
 * Services Listing Page
 *
 * Main page that displays all published services in a responsive grid layout.
 * This page is SEO-optimized with structured data and metadata.
 *
 * Features:
 * - Breadcrumb navigation
 * - Page header with title and description
 * - Responsive grid layout (1 column mobile, 2 tablet, 3 desktop)
 * - Service cards with hover effects
 * - Empty state handling for no published services
 * - SEO metadata with OpenGraph tags
 * - Structured data (ItemList schema and BreadcrumbList schema)
 *
 * Route: /services
 */
import { BreadcrumbSchema, JsonLd, WebPageSchema } from '@workspace/seo/react'

import { ServiceCardHorizontal } from '@/components/services/ServiceCardHorizontal.component'
import { ServicesContact } from '@/components/services/ServicesContact.component'
import { ServicesTestimonials } from '@/components/services/ServicesTestimonials.component'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs.component'
import { ContentWrapper } from '@/components/shared/ContentWrapper.component'
import { FAQComponent } from '@/components/shared/FAQ.component'
import { Gallery } from '@/components/shared/Gallery.component'
import { SectionContainer } from '@/components/shared/SectionContainer.component'
import { SectionHeader } from '@/components/shared/SectionHeader.component'
import { servicesFAQ } from '@/lib/data/services/services-page-content'
import { siteConfig } from '@/lib/data/site-config'
import { getPublishedServices } from '@/lib/queries/get-services.query'
import { getServicesGalleryImages } from '@/lib/queries/get-services-gallery.query'
import { seoConfig } from '@/lib/seo-config'
import { generateServicesListSchema } from '@/lib/seo/service-schema.util'
import { toNextMetadata } from '@/lib/seo/metadata'

/**
 * Generate page metadata
 *
 * Creates SEO-optimized metadata for the services listing page
 * including title, description, and OpenGraph tags.
 */
export const metadata = toNextMetadata(seoConfig, {
    title: `Our Services | ${seoConfig.siteName}`,
    description:
        'Explore our comprehensive range of professional services designed to help your business grow and succeed. From development to design and marketing.',
    canonical: '/services',
    openGraph: {
        title: `Our Services | ${seoConfig.siteName}`,
        description:
            'Explore our comprehensive range of professional services designed to help your business grow and succeed.',
        url: `${seoConfig.siteUrl}/services`,
        type: 'website',
        siteName: seoConfig.siteName,
    },
    twitter: {
        card: 'summary_large_image',
        title: `Our Services | ${seoConfig.siteName}`,
        description:
            'Explore our comprehensive range of professional services designed to help your business grow and succeed.',
    },
})

/**
 * Services Listing Page Component
 *
 * Displays all published services with breadcrumbs, header, and grid layout.
 * Handles empty state when no services are published.
 */
export default function ServicesPage() {
    // Get all published services sorted by order
    const services = getPublishedServices()

    // Get gallery images from services (limit to 9 images)
    const galleryImages = getServicesGalleryImages(9)

    // Generate base URL for structured data
    const baseUrl = siteConfig.seo.siteUrl

    // Generate ItemList schema for services listing
    const servicesListSchema = generateServicesListSchema(services, baseUrl)

    // Breadcrumb items for navigation
    const breadcrumbItems = [
        { label: 'Home', href: '/' },
        { label: 'Services' }, // Current page (no href)
    ]

    // Breadcrumb schema items
    const breadcrumbSchemaItems = [
        { name: 'Home', item: baseUrl },
        { name: 'Services', item: `${baseUrl}/services` },
    ]

    return (
        <>
            {/* SEO Schema Components */}
            <WebPageSchema
                name={metadata.title as string}
                url={`${seoConfig.siteUrl}/services`}
                description={metadata.description as string}
            />

            <BreadcrumbSchema items={breadcrumbSchemaItems} />

            <JsonLd data={servicesListSchema} />

            {/* Page Container */}
            <SectionContainer as='section' variant='subtle' id='services-page'>
                <ContentWrapper size='lg'>
                    {/* Breadcrumbs Navigation */}
                    <div className='mb-8'>
                        <Breadcrumbs
                            items={breadcrumbItems}
                            showBackground={true}
                        />
                    </div>

                    {/* Page Header */}
                    <SectionHeader
                        badge='Our Services'
                        title='Comprehensive Solutions for Your Business'
                        description='Explore our range of professional services designed to help your business grow and succeed. From development to design and marketing, we have the expertise to bring your vision to life.'
                        as='h1'
                        align='center'
                        spacing='loose'
                        className='mb-32'
                    />

                    {/* Services List with Horizontal Cards */}
                    {services.length > 0 ? (
                        <div
                            className='space-y-32'
                            role='list'
                            aria-label='Available services'
                        >
                            {services.map((service, index) => (
                                <div key={service.slug} role='listitem'>
                                    <ServiceCardHorizontal
                                        service={service}
                                        imagePosition={
                                            index % 2 === 0 ? 'left' : 'right'
                                        }
                                        className='h-full'
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        // Empty State
                        <div className='border-border/50 bg-muted/30 flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed px-6 py-12 text-center'>
                            <div className='mx-auto max-w-md space-y-4'>
                                <div className='flex justify-center'>
                                    <div className='bg-muted flex h-16 w-16 items-center justify-center rounded-full'>
                                        <svg
                                            className='text-muted-foreground h-8 w-8'
                                            fill='none'
                                            viewBox='0 0 24 24'
                                            stroke='currentColor'
                                            aria-hidden='true'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={1.5}
                                                d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4'
                                            />
                                        </svg>
                                    </div>
                                </div>
                                <h2 className='text-foreground text-2xl font-semibold'>
                                    No Services Available
                                </h2>
                                <p className='text-muted-foreground text-sm'>
                                    We are currently updating our service
                                    offerings. Please check back soon or{' '}
                                    <a
                                        href='/contact'
                                        className='text-primary font-medium underline-offset-4 hover:underline'
                                    >
                                        contact us
                                    </a>{' '}
                                    for more information about how we can help
                                    your business.
                                </p>
                            </div>
                        </div>
                    )}
                </ContentWrapper>
            </SectionContainer>

            {/* Services Gallery Section */}
            {galleryImages.length > 0 && (
                <SectionContainer variant='gradient' id='gallery'>
                    <ContentWrapper size='lg'>
                        <SectionHeader
                            title='Our Work Gallery'
                            description='Examples of our work and capabilities across different services'
                            align='center'
                            spacing='loose'
                            className='mb-12'
                        />
                        <Gallery
                            images={galleryImages}
                            columns={{ mobile: 1, tablet: 2, desktop: 3 }}
                            aspectRatio='video'
                        />
                    </ContentWrapper>
                </SectionContainer>
            )}

            {/* Services Testimonials Section */}
            <ServicesTestimonials />

            {/* Services FAQ Section */}
            <FAQComponent
                faqs={servicesFAQ}
                title='Frequently Asked Questions'
                description='Common questions about our services and working with us'
                variant='gradient-reverse'
                includeSchema={true}
            />

            {/* Services Contact Section */}
            <ServicesContact />
        </>
    )
}

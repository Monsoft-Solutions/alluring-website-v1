/**
 * Service Detail Page
 *
 * Dynamic route for individual service pages displaying comprehensive
 * service information including features, benefits, process, and CTAs.
 *
 * Features:
 * - Static generation for all published services at build time
 * - SEO-optimized with service-specific metadata and structured data
 * - Breadcrumb navigation for improved UX and SEO
 * - Hero section with service overview and CTAs
 * - 404 handling for non-existent services
 * - Mobile-first responsive design
 *
 * Route: /services/[slug]
 * Example: /services/web-development
 */

import { BreadcrumbSchema, JsonLd, WebPageSchema } from '@workspace/seo/react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ServiceBenefits } from '@/components/services/service-benefits.component'
import { ServiceCTA } from '@/components/services/service-cta.component'
import { ServiceFeatures } from '@/components/services/service-features.component'
import { ServiceGallery } from '@/components/services/service-gallery.component'
import { ServiceHero } from '@/components/services/service-hero.component'
import { ServiceProcess } from '@/components/services/service-process.component'
import { Breadcrumbs } from '@/components/shared/breadcrumbs.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { FAQComponent } from '@/components/shared/faq.component'
import { siteConfig } from '@/lib/data/site-config'
import {
    getPublishedServices,
    getServiceBySlug,
} from '@/lib/queries/get-services.query'
import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'
import { generateServiceSchema } from '@/lib/seo/service-schema.util'

/**
 * Generate static params for all published services
 *
 * This function tells Next.js which dynamic routes to pre-render at build time.
 * All published services will have their pages statically generated.
 *
 * @returns Array of params objects with slug property
 */
export function generateStaticParams() {
    const services = getPublishedServices()

    return services.map((service) => ({
        slug: service.slug,
    }))
}

/**
 * Generate metadata for service detail page
 *
 * Creates SEO-optimized metadata including:
 * - Service-specific title and description
 * - Open Graph tags for social media sharing
 * - Twitter Card configuration
 * - Canonical URL
 *
 * @param props - Page props containing route params
 * @returns Next.js Metadata object
 */
export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> {
    const { slug } = await params
    const service = getServiceBySlug(slug)

    // Return default metadata if service not found (will show 404)
    if (!service) {
        return {
            title: 'Service Not Found',
            description: 'The requested service could not be found.',
        }
    }

    // Use service SEO title/description or fallback to defaults
    const title = service.seo.title || service.title
    const description = service.seo.description || service.excerpt

    // Generate OG image URL
    const ogImageUrl = service.seo.ogImage
        ? `${seoConfig.siteUrl}${service.seo.ogImage}`
        : service.iconConfig.heroImagePath
          ? `${seoConfig.siteUrl}${service.iconConfig.heroImagePath}`
          : `${seoConfig.siteUrl}${siteConfig.brand.ogImage}`

    return toNextMetadata(seoConfig, {
        title: `${title} | ${seoConfig.siteName}`,
        description,
        canonical: `/services/${service.slug}`,
        keywords: service.seo.keywords,
        openGraph: {
            title: `${title} | ${seoConfig.siteName}`,
            description,
            url: `${seoConfig.siteUrl}/services/${service.slug}`,
            type: 'website',
            siteName: seoConfig.siteName,
            images: [
                {
                    url: ogImageUrl,
                    width: 1200,
                    height: 630,
                    alt: service.iconConfig.imageAlt,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${title} | ${seoConfig.siteName}`,
            description,
            images: [ogImageUrl],
        },
    })
}

/**
 * Service Detail Page Component
 *
 * Main page component that renders the service detail page.
 * Includes breadcrumbs, hero section, and structured data.
 *
 * @param props - Page props containing route params
 */
export default async function ServiceDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const service = getServiceBySlug(slug)

    // Show 404 if service not found
    if (!service) {
        notFound()
    }

    // Generate full URLs for structured data
    const baseUrl = siteConfig.seo.siteUrl
    const serviceUrl = `${baseUrl}/services/${service.slug}`

    // Generate Service schema for structured data
    const serviceSchema = generateServiceSchema(service, serviceUrl)

    // Breadcrumb data for navigation component
    const breadcrumbItems = [
        { label: 'Home', href: '/' },
        { label: 'Services', href: '/services' },
        { label: service.title }, // Current page (no href)
    ]

    // Breadcrumb schema for structured data
    const breadcrumbSchemaItems = [
        { name: 'Home', item: baseUrl },
        { name: 'Services', item: `${baseUrl}/services` },
        { name: service.title, item: serviceUrl },
    ]

    // Prepare metadata for WebPageSchema
    const metadata = await generateMetadata({ params })

    return (
        <>
            {/* SEO Schema Components */}
            <WebPageSchema
                name={metadata.title as string}
                url={serviceUrl}
                description={metadata.description as string}
            />

            <BreadcrumbSchema items={breadcrumbSchemaItems} />

            <JsonLd data={serviceSchema} />

            {/* Main Content */}
            <main>
                {/* Breadcrumbs Navigation */}
                <div className='pt-8 pb-4'>
                    <ContentWrapper>
                        <Breadcrumbs
                            items={breadcrumbItems}
                            showBackground={true}
                        />
                    </ContentWrapper>
                </div>

                {/* Service Hero Section */}
                <article>
                    <ServiceHero
                        title={service.title}
                        description={service.description}
                        category={service.category}
                        categoryLabel={service.categoryLabel}
                        heroImage={
                            service.iconConfig.heroImagePath
                                ? {
                                      url: service.iconConfig.heroImagePath,
                                      alt: service.iconConfig.imageAlt,
                                  }
                                : undefined
                        }
                        primaryButton={{
                            text: service.cta.primaryButton.text,
                            href: service.cta.primaryButton.href,
                        }}
                        secondaryButton={
                            service.cta.secondaryButton
                                ? {
                                      text: service.cta.secondaryButton.text,
                                      href: service.cta.secondaryButton.href,
                                  }
                                : undefined
                        }
                    />

                    {/* Service Features Section */}
                    <ServiceFeatures
                        features={service.features}
                        title='Key Features'
                        description='Comprehensive capabilities designed to meet your needs'
                        variant='muted'
                    />

                    {/* Service Benefits Section */}
                    <ServiceBenefits
                        benefits={service.benefits}
                        title='Why Choose This Service'
                        description='Real results that drive your business forward'
                        variant='default'
                    />

                    {/* Service Gallery Section (Optional) */}
                    {service.gallery && service.gallery.length > 0 && (
                        <ServiceGallery
                            images={service.gallery}
                            title='Project Gallery'
                            description='Examples of our work and capabilities'
                            variant='muted'
                        />
                    )}

                    {/* Service Process Section (Optional) */}
                    {service.process && service.process.length > 0 && (
                        <ServiceProcess
                            steps={service.process}
                            title='Our Process'
                            description='A proven methodology that delivers exceptional results'
                            variant='default'
                        />
                    )}

                    {/* FAQ Section (Optional) */}
                    {service.faqs && service.faqs.length > 0 && (
                        <FAQComponent
                            faqs={service.faqs}
                            title='Frequently Asked Questions'
                            description='Common questions about our service'
                            variant='muted'
                        />
                    )}

                    {/* Call-to-Action Section */}
                    <ServiceCTA
                        heading={service.cta.heading}
                        description={service.cta.description}
                        primaryButton={service.cta.primaryButton}
                        secondaryButton={service.cta.secondaryButton}
                        variant='accent'
                    />
                </article>
            </main>
        </>
    )
}

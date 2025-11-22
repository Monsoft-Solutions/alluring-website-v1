import type { Metadata } from 'next'

import { seoConfig } from '@/lib/seo-config'
import { toNextMetadata } from '@/lib/seo/metadata'
import type { Service } from '@/lib/types/services/service.type'

/**
 * Generate metadata for a service detail page.
 * Uses service-specific SEO overrides with sensible fallbacks.
 */
export function generateServiceMetadata(service: Service): Metadata {
    const title =
        service.seo.title || `${service.title} | ${seoConfig.siteName}`
    const description = service.seo.description || service.excerpt
    const ogImage = service.seo.ogImage || service.iconConfig.heroImagePath

    return toNextMetadata(seoConfig, {
        title,
        description,
        canonical: `/services/${service.slug}`,
        keywords: service.seo.keywords,
        openGraph: {
            type: 'website',
            title,
            description,
            url: `${seoConfig.siteUrl}/services/${service.slug}`,
            images: ogImage
                ? [
                      {
                          url: `${ogImage.startsWith('http') ? '' : seoConfig.siteUrl}${ogImage}`,
                          alt: service.iconConfig.imageAlt || service.title,
                          width: 1200,
                          height: 630,
                      },
                  ]
                : undefined,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: ogImage
                ? [
                      `${ogImage.startsWith('http') ? '' : seoConfig.siteUrl}${ogImage}`,
                  ]
                : undefined,
        },
    })
}

/**
 * Generate metadata for the services listing page.
 */
export function generateServicesListingMetadata(): Metadata {
    const title = `Our Services | ${seoConfig.siteName}`
    const description =
        'Explore our comprehensive range of services designed to help your business grow and succeed.'

    return toNextMetadata(seoConfig, {
        title,
        description,
        canonical: '/services',
        openGraph: {
            type: 'website',
            title,
            description,
            url: `${seoConfig.siteUrl}/services`,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
        },
    })
}

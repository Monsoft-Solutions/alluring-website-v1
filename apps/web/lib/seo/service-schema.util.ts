/**
 * Service Schema Utilities
 *
 * Functions to generate Schema.org structured data for service pages.
 * This helps search engines understand the content and display rich results.
 *
 * @see https://schema.org/Service
 * @see https://schema.org/ItemList
 */

import type {
    ItemList,
    Service as SchemaService,
    WithContext,
} from 'schema-dts'

import { siteConfig } from '@/lib/data/site-config'
import type { Service } from '@/lib/types/services/service.type'

/**
 * Generate Service schema for individual service pages
 *
 * Creates a Service schema with provider information, service type,
 * and relevant metadata for search engines.
 *
 * @param service - Service data object
 * @param url - Full URL to the service page
 * @returns Schema.org Service object
 *
 * @example
 * const schema = generateServiceSchema(service, 'https://example.com/services/web-development')
 */
export function generateServiceSchema(
    service: Service,
    url: string
): WithContext<SchemaService> {
    return {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: service.title,
        description: service.excerpt,
        provider: {
            '@type': 'Organization',
            name: siteConfig.business.name,
            url: siteConfig.seo.siteUrl,
        },
        serviceType: service.categoryLabel,
        url,
        image: service.iconConfig.heroImagePath
            ? `${siteConfig.seo.siteUrl}${service.iconConfig.heroImagePath}`
            : undefined,
        offers: service.cta
            ? {
                  '@type': 'Offer',
                  description: service.cta.description,
                  url: `${siteConfig.seo.siteUrl}${service.cta.primaryButton.href}`,
              }
            : undefined,
    }
}

/**
 * Generate ItemList schema for services listing page
 *
 * Creates an ItemList schema that lists all published services.
 * This helps search engines understand the relationship between services.
 *
 * @param services - Array of published services
 * @param baseUrl - Base URL for the site
 * @returns Schema.org ItemList object
 *
 * @example
 * const schema = generateServicesListSchema(services, 'https://example.com')
 */
export function generateServicesListSchema(
    services: Service[],
    baseUrl: string
): WithContext<ItemList> {
    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Our Services',
        description: 'Complete list of services we offer',
        numberOfItems: services.length,
        itemListElement: services.map((service, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
                '@type': 'Service',
                name: service.title,
                description: service.excerpt,
                url: `${baseUrl}/services/${service.slug}`,
                serviceType: service.categoryLabel,
            },
        })),
    }
}

/**
 * Service Query Functions
 *
 * Functions to retrieve and filter service data.
 * These queries are used throughout the application to access service information.
 *
 * @example Get all published services
 * const services = getPublishedServices()
 *
 * @example Get services by category
 * const devServices = getServicesByCategory('development')
 *
 * @example Get all categories
 * const categories = getServiceCategories()
 */
import type { Service } from '@/lib/types/services/service.type'
import type { ServiceCategory } from '@/lib/types/services/service-category.type'
import { services } from '@/lib/data/services/services-data'

/**
 * Get all published services sorted by order
 *
 * Filters out unpublished services and sorts by the `order` field (ascending).
 * Services without an explicit order value default to 0.
 *
 * @returns Array of published services, sorted by order
 *
 * @example
 * const allServices = getPublishedServices()
 * // Returns: [{ slug: 'web-dev', order: 1, ... }, { slug: 'design', order: 2, ... }]
 */
export function getPublishedServices(): Service[] {
    return services
        .filter((service) => service.isPublished !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

/**
 * Get services by category
 *
 * Filters published services to return only those matching the specified category.
 *
 * @param category - The category to filter by
 * @returns Array of published services in the specified category, sorted by order
 *
 * @example
 * const devServices = getServicesByCategory('development')
 * // Returns: [{ slug: 'web-dev', category: 'development', ... }, ...]
 */
export function getServicesByCategory(
    category: ServiceCategory | string
): Service[] {
    return getPublishedServices().filter(
        (service) => service.category === category
    )
}

/**
 * Get a single service by slug
 *
 * Returns the service matching the provided slug, or undefined if not found.
 * Only returns published services.
 *
 * @param slug - The service slug to search for
 * @returns Service object or undefined if not found
 *
 * @example
 * const service = getServiceBySlug('web-development')
 * // Returns: { slug: 'web-development', title: 'Web Development', ... }
 */
export function getServiceBySlug(slug: string): Service | undefined {
    return getPublishedServices().find((service) => service.slug === slug)
}

/**
 * Get all unique categories
 *
 * Returns a list of all categories that have at least one published service.
 * Useful for building category filters or navigation.
 *
 * @returns Array of unique category strings
 *
 * @example
 * const categories = getServiceCategories()
 * // Returns: ['development', 'design', 'marketing']
 */
export function getServiceCategories(): string[] {
    const categories = new Set(
        getPublishedServices().map((service) => service.category)
    )
    return Array.from(categories)
}

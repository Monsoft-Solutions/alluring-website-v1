/**
 * Get Services Gallery Query
 *
 * Query function to retrieve gallery images from all published services.
 * Aggregates gallery images across all services for the services listing page.
 */

import type { GalleryImage } from '@/lib/types/shared/gallery-image.type'

import { getPublishedServices } from './get-services.query'

/**
 * Get all gallery images from published services
 *
 * Aggregates gallery images from all published services that have gallery arrays.
 * Useful for displaying a portfolio/gallery on the services listing page.
 *
 * @param limit - Optional maximum number of images to return
 * @returns Array of GalleryImage objects from all published services
 *
 * @example
 * ```tsx
 * const galleryImages = getServicesGalleryImages(9) // Get first 9 images
 * ```
 */
export function getServicesGalleryImages(limit?: number): GalleryImage[] {
    const services = getPublishedServices()

    // Aggregate all gallery images from services
    const allGalleryImages: GalleryImage[] = services
        .filter((service) => service.gallery && service.gallery.length > 0)
        .flatMap((service) => service.gallery || [])

    // Apply limit if specified
    if (limit && limit > 0) {
        return allGalleryImages.slice(0, limit)
    }

    return allGalleryImages
}

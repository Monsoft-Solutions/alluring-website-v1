import type { FaqItem } from '@/lib/types/shared/faq.type'

import type { ServiceBenefit } from './service-benefit.type'
import type { ServiceCategory } from './service-category.type'
import type { ServiceCTA } from './service-cta.type'
import type { ServiceFeature } from './service-feature.type'
import type { ServiceIcon } from './service-icon.type'
import type { ServiceProcessStep } from './service-process-step.type'
import { GalleryImage } from '../shared/gallery-image.type'

/**
 * Main Service Type
 *
 * Complete service data structure representing all information
 * needed to render a service listing card and detail page.
 *
 * This is the central type for service data. Each service includes:
 * - Basic information (title, description, category)
 * - Features and capabilities
 * - Benefits and outcomes
 * - Optional process steps
 * - SEO metadata
 * - Call-to-action configuration
 *
 * @example
 * const service: Service = {
 *     slug: 'web-development',
 *     title: 'Web Development',
 *     excerpt: 'Build fast, scalable web applications',
 *     description: 'Full description here...',
 *     category: 'development',
 *     categoryLabel: 'Development',
 *     iconConfig: { type: 'icon', icon: Code },
 *     features: [...],
 *     benefits: [...],
 *     cta: {...},
 *     seo: {...},
 *     order: 1,
 *     isPublished: true
 * }
 */
export type Service = {
    /**
     * Unique identifier (used for routing)
     * Format: kebab-case (e.g., 'web-development')
     * Must be unique across all services
     */
    readonly slug: string

    /**
     * Service name/title
     */
    readonly title: string

    /**
     * Short description (used in cards and meta description)
     * Recommended: 120-160 characters for SEO
     */
    readonly excerpt: string

    /**
     * Full service description (used on detail page)
     * Can include multiple paragraphs
     */
    readonly description: string

    /**
     * Service category
     */
    readonly category: ServiceCategory

    /**
     * Display category name (e.g., 'Web Development')
     */
    readonly categoryLabel: string

    /**
     * Service icon configuration
     */
    readonly iconConfig: ServiceIcon

    /**
     * Service features/capabilities
     * Minimum 3 recommended
     */
    readonly features: ServiceFeature[]

    /**
     * Service benefits
     * Minimum 3, maximum 6 recommended
     */
    readonly benefits: ServiceBenefit[]

    /**
     * Optional process steps
     * 4-6 steps recommended if included
     */
    readonly process?: ServiceProcessStep[]

    /**
     * Optional gallery images for detail page
     * 4-6 images recommended if included
     */
    readonly gallery?: GalleryImage[]

    /**
     * Optional frequently asked questions
     * 3-5 FAQs recommended if included
     */
    readonly faqs?: FaqItem[]

    /**
     * Call-to-action configuration
     */
    readonly cta: ServiceCTA

    /**
     * SEO metadata
     */
    readonly seo: {
        /**
         * Page title (falls back to service title)
         */
        readonly title?: string

        /**
         * Meta description (falls back to excerpt)
         */
        readonly description?: string

        /**
         * Additional keywords
         */
        readonly keywords?: string[]

        /**
         * OG image (optional, uses iconConfig.imagePath if not provided)
         */
        readonly ogImage?: string
    }

    /**
     * Display order (lower numbers appear first)
     * @default 0
     */
    readonly order?: number

    /**
     * Whether service is published and visible on the website
     * @default true
     */
    readonly isPublished?: boolean
}

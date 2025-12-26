/**
 * FAQ Type
 *
 * Type definition for frequently asked questions sections.
 * Can be used across any page or component that displays FAQs.
 *
 * Used in:
 * - Service pages
 * - Product pages
 * - Support pages
 * - FAQ component
 * - CategorizedFAQ component
 */

// FaqItem is the single source of truth from @workspace/shared
export type { FaqItem } from '@workspace/shared/schemas/blog'

/**
 * FAQ Category
 *
 * Represents a category for organizing FAQs.
 * Used in the CategorizedFAQ component.
 */
export type FaqCategory = {
    /**
     * Unique identifier for the category
     */
    readonly id: string

    /**
     * Display label for the category
     */
    readonly label: string
}

/**
 * CTA Configuration
 *
 * Configuration for the "Still have questions?" call-to-action section
 * displayed at the bottom of FAQ components.
 */
export type FaqCtaConfig = {
    /**
     * Main title/heading for the CTA
     * @example "Still have questions?"
     */
    readonly title: string

    /**
     * Supporting description text
     * @example "Our patient concierge is ready to help you."
     */
    readonly description: string

    /**
     * Text displayed on the CTA button
     * @example "Chat with Concierge"
     */
    readonly buttonText: string

    /**
     * Phone number for the call-to-action
     * Should be in format that works with tel: links
     * @example "7863058649"
     */
    readonly phoneNumber: string
}

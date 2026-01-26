/**
 * CollectionPage Schema Type Definition
 *
 * A web page that contains a collection of content, such as articles
 * grouped by a tag or category. Used for tag and category archive pages.
 *
 * @see https://schema.org/CollectionPage
 */

/**
 * Item in the collection (typically an article/blog post)
 */
export type CollectionItem = {
    /** URL of the item */
    url: string
    /** Name/title of the item */
    name: string
    /** Headline (same as name, for Article schema compatibility) */
    headline?: string
    /** Description or excerpt */
    description?: string
    /** Image URL */
    image?: string
    /** Date published (ISO 8601) */
    datePublished?: string
    /** Author name (for Article schema compatibility) */
    author?: string
}

/**
 * Subject the collection is about (for tag/category pages)
 */
export type CollectionAbout = {
    /** Type of thing - typically 'Thing' for generic topics */
    '@type'?: 'Thing' | 'MedicalProcedure' | 'MedicalSpecialty'
    /** Name of the topic/category */
    name: string
    /** Description of the topic */
    description?: string
    /** URL with more information about this topic */
    url?: string
}

export type CollectionPageSchemaProps = {
    /** URL of the collection page */
    url: string
    /** Name of the collection page (e.g., "Breast Augmentation Articles") */
    name: string
    /** Description of the collection */
    description?: string
    /**
     * What the collection is about (tag or category topic)
     */
    about?: CollectionAbout
    /**
     * Items in the collection with positions
     * These will be rendered as an ItemList within the CollectionPage
     */
    hasPart?: CollectionItem[]
    /**
     * Number of items in the collection
     */
    numberOfItems?: number
    /**
     * Publisher of the collection page
     */
    publisher?: {
        name: string
        url?: string
        logo?: string
    }
    /**
     * Whether this is a category (true) or tag (false) page
     * Affects the specialization of the schema
     */
    isCategory?: boolean
}

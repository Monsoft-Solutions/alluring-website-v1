/**
 * ProfilePage Schema Type Definition
 *
 * A web page type that represents a profile page about a particular Person,
 * Organization, or other entity. Google uses this for knowledge panel enrichment.
 *
 * @see https://schema.org/ProfilePage
 * @see https://developers.google.com/search/docs/appearance/structured-data/profile-page
 */

/**
 * Main entity of the profile page - typically a Person or Organization
 */
export type ProfilePageMainEntity = {
    /** Type of entity: Person, Physician, or Organization */
    '@type': 'Person' | 'Physician' | 'Organization'
    /**
     * Entity ID for Knowledge Graph linking
     * Should match the @id used in Person/Physician schema elsewhere
     */
    '@id'?: string
    /** Name of the person or organization */
    name: string
    /** URL of the entity's main page */
    url?: string
    /** Image URL */
    image?: string
    /** Description of the entity */
    description?: string
    /** Job title (for Person/Physician) */
    jobTitle?: string
    /** Works for organization (for Person/Physician) */
    worksFor?: {
        '@type': 'Organization'
        name: string
        url?: string
        /** Organization address (recommended for rich results eligibility) */
        address?: {
            streetAddress?: string
            addressLocality?: string
            addressRegion?: string
            postalCode?: string
            addressCountry?: string
        }
    }
    /** Same as links (social profiles, professional directories) */
    sameAs?: string[]
}

export type ProfilePageSchemaProps = {
    /** URL of the profile page */
    url: string
    /** Name/title of the profile page */
    name: string
    /** Description of the profile page */
    description?: string
    /** Date the profile was first published (ISO 8601) */
    dateCreated?: string
    /** Date the profile was last modified (ISO 8601) */
    dateModified?: string
    /** Main entity that the profile page is about */
    mainEntity: ProfilePageMainEntity
    /**
     * Significant links within the profile (e.g., gallery, contact sections)
     * Helps Google understand page structure
     */
    significantLinks?: string[]
    /**
     * The organization/site publishing this profile page
     */
    publisher?: {
        name: string
        url?: string
        logo?: string
    }
}

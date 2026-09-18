/**
 * OrganizationSchemaProps
 */

export type OrganizationSchemaProps = {
    /**
     * Entity identifier for Knowledge Graph linking.
     * When provided, creates an identifiable entity that can be referenced
     * from other schemas via @id for entity consolidation.
     * Format: "https://www.example.com/#organization"
     */
    id?: string
    /**
     * A more specific schema.org type for the same entity. Every page that
     * publishes this `@id` must use the same one, or the entity reads as
     * several different kinds of thing. Default: `Organization`.
     */
    type?: 'Organization' | 'MedicalBusiness' | 'MedicalClinic'
    name: string
    url: string
    logo?: string
    legalName?: string
    foundingDate?: string
    founders?: string[]
    address?: {
        streetAddress?: string
        addressLocality?: string
        addressRegion?: string
        postalCode?: string
        addressCountry?: string
    }
    contactPoint?: Array<{
        contactType: string
        telephone?: string
        email?: string
        areaServed?: string
        availableLanguage?: string[]
    }>
    sameAs?: string[]
}

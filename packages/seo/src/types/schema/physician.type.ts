/**
 * Physician Schema Type Definition
 *
 * Used for surgeon/doctor pages to provide rich structured data
 * with E-E-A-T signals (Experience, Expertise, Authoritativeness, Trustworthiness).
 *
 * @see https://schema.org/Physician
 */
export type PhysicianSchemaProps = {
    /** Name of the physician */
    name: string

    /** URL of the physician's profile page */
    url?: string

    /** Profile image URL */
    image?: string

    /** Short bio or description */
    description?: string

    /** Medical specialty (e.g., "Plastic Surgery") */
    medicalSpecialty?: string | string[]

    /** Services/procedures the physician performs */
    availableService?: PhysicianService[]

    /** Professional memberships and associations */
    memberOf?: PhysicianMembership[]

    /** Medical school/training institution */
    alumniOf?: PhysicianEducation[]

    /** Board certifications and awards */
    award?: string[]

    /** Job title (e.g., "Board-Certified Plastic Surgeon") */
    jobTitle?: string

    /** Works for organization */
    worksFor?: {
        name: string
        url?: string
    }

    /** Contact information */
    telephone?: string

    /** Email address */
    email?: string

    /** Address of practice */
    address?: PhysicianAddress

    /** Same as links (social profiles, medical board pages, etc.) */
    sameAs?: string[]
}

export type PhysicianService = {
    name: string
    url?: string
    description?: string
}

export type PhysicianMembership = {
    name: string
    url?: string
}

export type PhysicianEducation = {
    name: string
    url?: string
}

export type PhysicianAddress = {
    streetAddress?: string
    addressLocality?: string
    addressRegion?: string
    postalCode?: string
    addressCountry?: string
}

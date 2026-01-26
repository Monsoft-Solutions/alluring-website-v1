/**
 * Physician Schema Type Definition
 *
 * Used for surgeon/doctor pages to provide rich structured data
 * with E-E-A-T signals (Experience, Expertise, Authoritativeness, Trustworthiness).
 *
 * @see https://schema.org/Physician
 */
export type PhysicianSchemaProps = {
    /**
     * Entity identifier for Knowledge Graph linking.
     * Format: "https://www.example.com/#physician-{slug}"
     */
    id?: string

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
        /** Reference to organization entity via @id (instead of embedding full org) */
        '@id'?: string
        name: string
        url?: string
        /** Organization address (recommended for rich results eligibility) */
        address?: PhysicianAddress
    }

    /** Contact information */
    telephone?: string

    /** Email address */
    email?: string

    /** Address of practice */
    address?: PhysicianAddress

    /** Same as links (social profiles, medical board pages, etc.) */
    sameAs?: string[]

    /**
     * Formal credentials (board certifications, licenses, degrees)
     * Provides strong E-E-A-T signals for medical expertise
     */
    hasCredential?: PhysicianCredential[]

    /**
     * Topics/procedures the physician specializes in
     * Helps Google understand expertise areas
     */
    knowsAbout?: string[]
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

/**
 * Educational or occupational credential for E-E-A-T signals
 * @see https://schema.org/EducationalOccupationalCredential
 */
export type PhysicianCredential = {
    /** Category of credential (e.g., "BoardCertification", "Degree", "License") */
    credentialCategory:
        | 'BoardCertification'
        | 'Degree'
        | 'License'
        | 'Certificate'
    /** Name of the credential (e.g., "Board Certified Plastic Surgeon") */
    name: string
    /** Organization that recognizes/issues this credential */
    recognizedBy?: {
        name: string
        url?: string
    }
    /** Geographic area where the credential is valid */
    validIn?: string
    /** Date the credential was issued (ISO format) */
    dateCreated?: string
}

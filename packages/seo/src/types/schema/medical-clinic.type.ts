/**
 * MedicalBusiness/MedicalClinic Schema Type Definition
 *
 * A more specific subtype of LocalBusiness for medical facilities.
 * Signals to Google this is a healthcare provider, enabling
 * healthcare-specific SERP features and better categorization.
 *
 * Note: MedicalBusiness is preferred over MedicalClinic for private practices
 * as MedicalClinic implies a facility associated with a hospital/medical school.
 *
 * @see https://schema.org/MedicalBusiness
 * @see https://schema.org/MedicalClinic
 */

export type MedicalClinicAddress = {
    streetAddress?: string
    addressLocality?: string
    addressRegion?: string
    postalCode?: string
    addressCountry?: string
}

export type MedicalClinicGeo = {
    latitude: number
    longitude: number
}

export type MedicalClinicOpeningHours = {
    dayOfWeek: string[]
    opens: string
    closes: string
}

export type MedicalClinicAggregateRating = {
    ratingValue: number
    reviewCount: number
    bestRating?: number
    worstRating?: number
}

/**
 * ContactPoint for different contact types
 * Helps Google understand different ways to reach the clinic
 */
export type MedicalClinicContactPoint = {
    /** Type of contact (e.g., "Appointments", "Customer Service") */
    contactType: string
    /** Phone number for this contact type */
    telephone?: string
    /** Email for this contact type */
    email?: string
    /** Languages available for this contact */
    availableLanguage?: string[]
    /** Geographic area served */
    areaServed?: string | string[]
}

/**
 * Available medical services/procedures
 */
export type MedicalClinicService = {
    name: string
    url?: string
    description?: string
}

export type MedicalClinicSchemaProps = {
    /** Name of the medical clinic */
    name: string

    /**
     * Unique entity identifier for Knowledge Graph
     * Should be a stable URI like https://example.com/#organization
     * Enables cross-page entity linking and helps Google build a coherent Knowledge Graph entry
     */
    id?: string

    /**
     * Schema type override
     * - 'MedicalBusiness' (default): Broader type for private medical practices
     * - 'MedicalClinic': More specific, implies association with hospital/medical school
     */
    schemaType?: 'MedicalBusiness' | 'MedicalClinic'

    /** URL of the clinic website */
    url?: string

    /** Logo image URL (should be absolute HTTPS URL) */
    logo?: string

    /** Primary phone number */
    telephone?: string

    /** Physical address */
    address?: MedicalClinicAddress

    /** Geographic coordinates */
    geo?: MedicalClinicGeo

    /** Operating hours */
    openingHoursSpecification?: MedicalClinicOpeningHours[]

    /** Images of the clinic */
    image?: string | string[]

    /** Aggregate review rating */
    aggregateRating?: MedicalClinicAggregateRating

    /**
     * Medical specialties
     * Can be simple strings (e.g., "PlasticSurgery") or full Schema.org URLs
     * (e.g., "https://schema.org/PlasticSurgery")
     * Simple strings will be automatically converted to Schema.org URLs
     */
    medicalSpecialty?: string[]

    /** Available medical services/procedures */
    availableService?: MedicalClinicService[]

    /** Whether the clinic is accepting new patients */
    isAcceptingNewPatients?: boolean

    /** Different contact points for the clinic */
    contactPoint?: MedicalClinicContactPoint[]

    /** Price range (e.g., "$$$" or "$2500-$25000") */
    priceRange?: string

    /** Languages supported */
    availableLanguage?: string[]

    /** Accepted payment methods */
    paymentAccepted?: string[]

    /** Social media and other profile links */
    sameAs?: string[]
}

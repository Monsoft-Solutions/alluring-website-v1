/**
 * Service Schema Type Definition
 *
 * Used for consultation and service pages to provide rich structured data
 * about services offered by the business.
 *
 * @see https://schema.org/Service
 */
export type ServiceSchemaProps = {
    /** Name of the service (e.g., "Free Plastic Surgery Consultation") */
    name: string

    /** Detailed description of the service */
    description: string

    /** URL of the service page */
    url?: string

    /** Organization or person providing the service */
    provider?: ServiceProvider

    /** Area served by the service (e.g., "Miami", "Latin America") */
    areaServed?: string | string[]

    /** Type of service offered */
    serviceType?: string

    /** Service offers/pricing */
    offers?: ServiceOffer

    /** Image representing the service */
    image?: string | string[]

    /** Category of the service */
    category?: string

    /** Languages the service is available in */
    availableLanguage?: string | string[]

    /** Brand associated with the service */
    brand?: string
}

export type ServiceProvider = {
    /** Name of the provider (organization or person) */
    name: string

    /** URL of the provider's website */
    url?: string

    /** Type of provider */
    type?: 'Organization' | 'Person'

    /** Logo URL for organization */
    logo?: string
}

export type ServiceOffer = {
    /** Price of the service (use 0 for free) */
    price: number

    /** Currency code (e.g., "USD") */
    priceCurrency: string

    /** Price specification (e.g., "Free", "Starting at $X") */
    priceSpecification?: string

    /** Availability status */
    availability?:
        | 'InStock'
        | 'OutOfStock'
        | 'PreOrder'
        | 'SoldOut'
        | 'LimitedAvailability'

    /** URL to book/purchase the service */
    url?: string
}

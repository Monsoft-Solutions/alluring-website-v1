/**
 * Offer Schema Type Definition
 *
 * Used for promotion pages to provide rich structured data
 * about promotional offers and discounts.
 *
 * @see https://schema.org/Offer
 * @see https://schema.org/OfferCatalog
 */

/**
 * Availability status for offers
 * @see https://schema.org/ItemAvailability
 */
export type OfferAvailability =
    | 'InStock'
    | 'OutOfStock'
    | 'PreOrder'
    | 'SoldOut'
    | 'LimitedAvailability'
    | 'OnlineOnly'
    | 'InStoreOnly'

/**
 * Item offered as part of the offer (procedure, service, etc.)
 */
export type OfferedItem = {
    /** Type of item (MedicalProcedure, Service, Product) */
    type: 'MedicalProcedure' | 'Service' | 'Product'

    /** Name of the item */
    name: string

    /** URL to the item's page */
    url?: string

    /** Description of the item */
    description?: string
}

/**
 * Address for LocalBusiness provider
 */
export type OfferProviderAddress = {
    /** Street address */
    streetAddress: string

    /** City */
    addressLocality: string

    /** State/Province */
    addressRegion: string

    /** Postal/ZIP code */
    postalCode: string

    /** Country */
    addressCountry: string
}

/**
 * Organization or business offering the promotion
 */
export type OfferProvider = {
    /**
     * Reference to an existing entity via @id
     * When provided, creates a linked reference in the Knowledge Graph
     * Should match the @id of the organization entity on other pages
     * (e.g., "https://www.example.com/#organization")
     * When @id is provided, other properties become optional (except name and type)
     */
    '@id'?: string

    /** Type of provider */
    type: 'LocalBusiness' | 'Organization' | 'MedicalBusiness'

    /** Name of the provider */
    name: string

    /** URL of the provider's website */
    url?: string

    /** Logo URL (for Organization) */
    logo?: string

    /** Image URL (for LocalBusiness) */
    image?: string

    /** Telephone number (for LocalBusiness) */
    telephone?: string

    /** Price range (for LocalBusiness) - e.g., "$$$" or "$$$$" */
    priceRange?: string

    /** Physical address (required for LocalBusiness) */
    address?: OfferProviderAddress
}

/**
 * Props for building an Offer JSON-LD schema
 */
export type OfferSchemaProps = {
    /** Name/title of the offer */
    name: string

    /** Description of the offer */
    description?: string

    /** Full URL of the offer page */
    url?: string

    /** Date the offer becomes valid (ISO 8601 format) */
    validFrom?: string

    /** Date the offer expires (ISO 8601 format) */
    validThrough?: string

    /** Date the price is valid until (ISO 8601 format) */
    priceValidUntil?: string

    /** Availability status of the offer */
    availability?: OfferAvailability

    /** Category of the offer (discount, seasonal, bundle, financing) */
    category?: string

    /** Image URL for the offer */
    image?: string

    /** Organization offering this promotion */
    offeredBy?: OfferProvider

    /** Item being offered (procedure, service, etc.) */
    itemOffered?: OfferedItem

    /**
     * Discount amount or percentage.
     * For percentage: "20%"
     * For fixed amount: "$500"
     */
    discount?: string

    /**
     * Text description of the discount.
     * E.g., "Save 20% on all procedures"
     */
    discountDescription?: string
}

/**
 * Individual offer item for catalog listing
 */
export type OfferCatalogItem = {
    /** Name/title of the offer */
    name: string

    /** Full URL of the offer page */
    url?: string

    /** Description of the offer */
    description?: string

    /** Date the offer expires (ISO 8601 format) */
    validThrough?: string

    /** Image URL for the offer */
    image?: string

    /** Category of the offer */
    category?: string
}

/**
 * Props for building an OfferCatalog JSON-LD schema
 */
export type OfferCatalogSchemaProps = {
    /** Name of the catalog (e.g., "Current Plastic Surgery Specials") */
    name: string

    /** Full URL of the catalog page */
    url?: string

    /** Description of the catalog */
    description?: string

    /** Number of items in the catalog */
    numberOfItems?: number

    /** List of offers in the catalog */
    itemListElement?: OfferCatalogItem[]

    /** Organization offering these promotions */
    offeredBy?: OfferProvider
}

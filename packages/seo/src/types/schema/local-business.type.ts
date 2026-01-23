export type LocalBusinessAddress = {
    streetAddress?: string
    addressLocality?: string
    addressRegion?: string
    postalCode?: string
    addressCountry?: string
}

export type LocalBusinessGeo = {
    latitude: number
    longitude: number
}

export type LocalBusinessOpeningHours = {
    dayOfWeek: string[]
    opens: string
    closes: string
}

export type LocalBusinessAggregateRating = {
    ratingValue: number
    reviewCount: number
    bestRating?: number
    worstRating?: number
}

export type LocalBusinessSchemaProps = {
    /**
     * Entity identifier for Knowledge Graph linking.
     * When provided, creates an identifiable entity that can be referenced
     * from other schemas via @id for entity consolidation.
     * Format: "https://www.example.com/#organization"
     */
    id?: string
    name: string
    url?: string
    telephone?: string
    address?: LocalBusinessAddress
    geo?: LocalBusinessGeo
    openingHoursSpecification?: LocalBusinessOpeningHours[]
    image?: string | string[]
    aggregateRating?: LocalBusinessAggregateRating
}

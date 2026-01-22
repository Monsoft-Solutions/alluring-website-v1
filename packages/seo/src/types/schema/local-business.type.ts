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
    name: string
    url?: string
    telephone?: string
    address?: LocalBusinessAddress
    geo?: LocalBusinessGeo
    openingHoursSpecification?: LocalBusinessOpeningHours[]
    image?: string | string[]
    aggregateRating?: LocalBusinessAggregateRating
}

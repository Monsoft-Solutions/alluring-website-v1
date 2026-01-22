import type { Offer, OfferCatalog, WithContext } from 'schema-dts'

import type {
    OfferCatalogSchemaProps,
    OfferSchemaProps,
} from '../types/schema/offer.type'
import { withContext } from './_internal'

/**
 * Builds JSON-LD structured data for an Offer
 *
 * Used for individual promotion detail pages to describe
 * promotional offers and enable rich results in search.
 *
 * @see https://schema.org/Offer
 */
export function buildOfferJsonLd(props: OfferSchemaProps): WithContext<Offer> {
    // Build the offer object dynamically
    const offer: Record<string, unknown> = {
        '@type': 'Offer',
        name: props.name,
    }

    // Add optional properties
    if (props.description) offer.description = props.description
    if (props.url) offer.url = props.url
    if (props.image) offer.image = props.image
    if (props.category) offer.category = props.category
    if (props.discount) offer.discount = props.discount
    if (props.discountDescription) {
        offer.discountDescription = props.discountDescription
    }

    // Handle date validity
    if (props.validFrom) offer.validFrom = props.validFrom
    if (props.validThrough) offer.validThrough = props.validThrough
    if (props.priceValidUntil) offer.priceValidUntil = props.priceValidUntil

    // Handle availability
    if (props.availability) {
        offer.availability = `https://schema.org/${props.availability}`
    }

    // Handle offeredBy (organization/business)
    if (props.offeredBy) {
        const offeredBy: Record<string, unknown> = {
            '@type': props.offeredBy.type,
            name: props.offeredBy.name,
        }

        if (props.offeredBy.url) offeredBy.url = props.offeredBy.url
        if (props.offeredBy.logo) offeredBy.logo = props.offeredBy.logo
        if (props.offeredBy.image) offeredBy.image = props.offeredBy.image
        if (props.offeredBy.telephone) {
            offeredBy.telephone = props.offeredBy.telephone
        }
        if (props.offeredBy.priceRange) {
            offeredBy.priceRange = props.offeredBy.priceRange
        }

        // Add address for LocalBusiness (required by Google)
        if (props.offeredBy.address) {
            offeredBy.address = {
                '@type': 'PostalAddress',
                streetAddress: props.offeredBy.address.streetAddress,
                addressLocality: props.offeredBy.address.addressLocality,
                addressRegion: props.offeredBy.address.addressRegion,
                postalCode: props.offeredBy.address.postalCode,
                addressCountry: props.offeredBy.address.addressCountry,
            }
        }

        offer.offeredBy = offeredBy
    }

    // Handle itemOffered (procedure, service, etc.)
    if (props.itemOffered) {
        offer.itemOffered = {
            '@type': props.itemOffered.type,
            name: props.itemOffered.name,
            ...(props.itemOffered.url && { url: props.itemOffered.url }),
            ...(props.itemOffered.description && {
                description: props.itemOffered.description,
            }),
        }
    }

    return withContext(offer as unknown as Offer)
}

/**
 * Builds JSON-LD structured data for an OfferCatalog
 *
 * Used for promotion listing pages to provide a catalog
 * of all available offers.
 *
 * @see https://schema.org/OfferCatalog
 */
export function buildOfferCatalogJsonLd(
    props: OfferCatalogSchemaProps
): WithContext<OfferCatalog> {
    // Build the catalog object dynamically
    const catalog: Record<string, unknown> = {
        '@type': 'OfferCatalog',
        name: props.name,
    }

    // Add optional properties
    if (props.url) catalog.url = props.url
    if (props.description) catalog.description = props.description
    if (props.numberOfItems !== undefined) {
        catalog.numberOfItems = props.numberOfItems
    }

    // Handle offeredBy (organization/business)
    if (props.offeredBy) {
        const offeredBy: Record<string, unknown> = {
            '@type': props.offeredBy.type,
            name: props.offeredBy.name,
        }

        if (props.offeredBy.url) offeredBy.url = props.offeredBy.url
        if (props.offeredBy.logo) offeredBy.logo = props.offeredBy.logo
        if (props.offeredBy.image) offeredBy.image = props.offeredBy.image
        if (props.offeredBy.telephone) {
            offeredBy.telephone = props.offeredBy.telephone
        }
        if (props.offeredBy.priceRange) {
            offeredBy.priceRange = props.offeredBy.priceRange
        }

        // Add address for LocalBusiness (required by Google)
        if (props.offeredBy.address) {
            offeredBy.address = {
                '@type': 'PostalAddress',
                streetAddress: props.offeredBy.address.streetAddress,
                addressLocality: props.offeredBy.address.addressLocality,
                addressRegion: props.offeredBy.address.addressRegion,
                postalCode: props.offeredBy.address.postalCode,
                addressCountry: props.offeredBy.address.addressCountry,
            }
        }

        catalog.offeredBy = offeredBy
    }

    // Handle itemListElement (list of offers)
    if (props.itemListElement && props.itemListElement.length > 0) {
        catalog.itemListElement = props.itemListElement.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
                '@type': 'Offer',
                name: item.name,
                ...(item.url && { url: item.url }),
                ...(item.description && { description: item.description }),
                ...(item.validThrough && { validThrough: item.validThrough }),
                ...(item.image && { image: item.image }),
                ...(item.category && { category: item.category }),
            },
        }))
    }

    return withContext(catalog as unknown as OfferCatalog)
}

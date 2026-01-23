import type { Service, WithContext } from 'schema-dts'

import type { ServiceSchemaProps } from '../types/schema/service.type'
import { withContext } from './_internal'

/**
 * Builds JSON-LD structured data for a Service
 *
 * Used for consultation and service pages to describe offerings
 * and enable rich results in search.
 *
 * Note: Some schema.org properties are valid but not in schema-dts types.
 * We build the object dynamically and cast to work around this.
 *
 * @see https://schema.org/Service
 */
export function buildServiceJsonLd(
    props: ServiceSchemaProps
): WithContext<Service> {
    // Normalize arrays
    const imageArray = props.image
        ? Array.isArray(props.image)
            ? props.image
            : [props.image]
        : undefined

    const areaServedArray = props.areaServed
        ? Array.isArray(props.areaServed)
            ? props.areaServed
            : [props.areaServed]
        : undefined

    const languageArray = props.availableLanguage
        ? Array.isArray(props.availableLanguage)
            ? props.availableLanguage
            : [props.availableLanguage]
        : undefined

    // Build the service object dynamically
    const service: Record<string, unknown> = {
        '@type': 'Service',
        name: props.name,
        description: props.description,
    }

    // Add optional properties
    if (props.url) service.url = props.url
    if (imageArray) service.image = imageArray
    if (props.serviceType) service.serviceType = props.serviceType
    if (props.category) service.category = props.category
    if (props.brand) service.brand = props.brand

    // Handle provider (Organization, Person, or MedicalBusiness)
    if (props.provider) {
        const providerType = props.provider.type ?? 'Organization'
        service.provider = {
            '@type': providerType,
            // Include @id for Knowledge Graph entity linking if provided
            ...(props.provider['@id'] && { '@id': props.provider['@id'] }),
            name: props.provider.name,
            ...(props.provider.url && { url: props.provider.url }),
            ...(props.provider.logo &&
                (providerType === 'Organization' ||
                    providerType === 'MedicalBusiness') && {
                    logo: props.provider.logo,
                }),
        }
    }

    // Handle areaServed
    if (areaServedArray && areaServedArray.length > 0) {
        service.areaServed = areaServedArray.map((area) => ({
            '@type': 'Place',
            name: area,
        }))
    }

    // Handle available languages
    if (languageArray && languageArray.length > 0) {
        service.availableLanguage = languageArray.map((lang) => ({
            '@type': 'Language',
            name: lang,
        }))
    }

    // Handle offers
    if (props.offers) {
        service.offers = {
            '@type': 'Offer',
            price: props.offers.price.toString(),
            priceCurrency: props.offers.priceCurrency,
            ...(props.offers.availability && {
                availability: `https://schema.org/${props.offers.availability}`,
            }),
            ...(props.offers.url && { url: props.offers.url }),
            ...(props.offers.priceSpecification && {
                priceSpecification: {
                    '@type': 'PriceSpecification',
                    price: props.offers.price.toString(),
                    priceCurrency: props.offers.priceCurrency,
                },
            }),
        }
    }

    return withContext(service as unknown as Service)
}

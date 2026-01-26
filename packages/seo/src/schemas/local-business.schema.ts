import type {
    GeoCoordinates,
    LocalBusiness,
    OpeningHoursSpecification,
    PostalAddress,
    WithContext,
} from 'schema-dts'

import type { LocalBusinessSchemaProps } from '../types/schema/local-business.type'
import { withContext } from './_internal'

export function buildLocalBusinessJsonLd(
    props: LocalBusinessSchemaProps
): WithContext<LocalBusiness> {
    // Build with @id for Knowledge Graph entity linking
    const lb: Record<string, unknown> = {
        '@type': 'LocalBusiness',
        // Include @id for entity identification and cross-page linking
        ...(props.id && { '@id': props.id }),
        name: props.name,
        url: props.url,
        telephone: props.telephone,
        image: props.image,
    }

    if (props.address) {
        const addr: PostalAddress = {
            '@type': 'PostalAddress',
            streetAddress: props.address.streetAddress,
            addressLocality: props.address.addressLocality,
            addressRegion: props.address.addressRegion,
            postalCode: props.address.postalCode,
            addressCountry: props.address.addressCountry,
        }
        lb.address = addr
    }

    if (props.geo) {
        const geo: GeoCoordinates = {
            '@type': 'GeoCoordinates',
            latitude: props.geo.latitude,
            longitude: props.geo.longitude,
        }
        lb.geo = geo
    }

    if (props.openingHoursSpecification) {
        const oh: OpeningHoursSpecification[] =
            props.openingHoursSpecification.map((o) => ({
                '@type': 'OpeningHoursSpecification',
                // Cast to expected union type for dayOfWeek
                dayOfWeek:
                    o.dayOfWeek as unknown as OpeningHoursSpecification['dayOfWeek'],
                opens: o.opens,
                closes: o.closes,
            }))
        lb.openingHoursSpecification = oh
    }

    if (props.aggregateRating) {
        lb.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: props.aggregateRating.ratingValue,
            reviewCount: props.aggregateRating.reviewCount,
            bestRating: props.aggregateRating.bestRating ?? 5,
            worstRating: props.aggregateRating.worstRating ?? 1,
        }
    }

    return withContext(lb as unknown as LocalBusiness)
}

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
    const lb: LocalBusiness = {
        '@type': 'LocalBusiness',
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

    return withContext(lb)
}

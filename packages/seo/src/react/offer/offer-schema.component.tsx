import type { Offer, WithContext } from 'schema-dts'

import { buildOfferJsonLd } from '../../schemas/offer.schema'
import type { OfferSchemaProps } from '../../types/schema/offer.type'
import { JsonLd } from '../json-ld.component'

export function OfferSchema(props: OfferSchemaProps) {
    const data: WithContext<Offer> = buildOfferJsonLd(props)
    return <JsonLd data={data} />
}

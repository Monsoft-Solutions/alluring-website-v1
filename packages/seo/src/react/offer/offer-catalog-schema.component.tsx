import type { OfferCatalog, WithContext } from 'schema-dts'

import { buildOfferCatalogJsonLd } from '../../schemas/offer.schema'
import type { OfferCatalogSchemaProps } from '../../types/schema/offer.type'
import { JsonLd } from '../json-ld.component'

export function OfferCatalogSchema(props: OfferCatalogSchemaProps) {
    const data: WithContext<OfferCatalog> = buildOfferCatalogJsonLd(props)
    return <JsonLd data={data} />
}

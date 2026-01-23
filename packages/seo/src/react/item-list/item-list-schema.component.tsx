import type { ItemList, WithContext } from 'schema-dts'

import { buildItemListJsonLd } from '../../schemas/item-list.schema'
import type { ItemListSchemaProps } from '../../types/schema/item-list.type'
import { JsonLd } from '../json-ld.component'

/**
 * ItemList Schema Component
 *
 * Renders JSON-LD structured data for a list of items.
 * Use on listing pages (procedures, services, categories) to help
 * Google understand the relationship between items.
 *
 * Benefits:
 * - Potential carousel rich results (limited eligibility)
 * - Clear content hierarchy for Google
 * - Better internal linking signals
 *
 * @see https://schema.org/ItemList
 * @see https://developers.google.com/search/docs/appearance/structured-data/carousel
 */
export function ItemListSchema(props: ItemListSchemaProps) {
    const data: WithContext<ItemList> = buildItemListJsonLd(props)
    return <JsonLd data={data} />
}

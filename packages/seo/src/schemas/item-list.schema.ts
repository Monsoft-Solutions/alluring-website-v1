import type { ItemList, WithContext } from 'schema-dts'

import type { ItemListSchemaProps } from '../types/schema/item-list.type'
import { withContext } from './_internal'

/**
 * Builds JSON-LD structured data for an ItemList
 *
 * Used for listing pages (e.g., procedure categories, service listings)
 * to help Google understand the relationship between items.
 *
 * @see https://schema.org/ItemList
 * @see https://developers.google.com/search/docs/appearance/structured-data/carousel
 */
export function buildItemListJsonLd(
    props: ItemListSchemaProps
): WithContext<ItemList> {
    // Map the order to schema.org values
    const orderMap: Record<string, string> = {
        Ascending: 'https://schema.org/ItemListOrderAscending',
        Descending: 'https://schema.org/ItemListOrderDescending',
        Unordered: 'https://schema.org/ItemListUnordered',
        ItemListOrderAscending: 'https://schema.org/ItemListOrderAscending',
        ItemListOrderDescending: 'https://schema.org/ItemListOrderDescending',
        ItemListUnordered: 'https://schema.org/ItemListUnordered',
    }

    // Build the list items
    const itemListElement = props.itemListElement.map((item) => ({
        '@type': 'ListItem' as const,
        position: item.position,
        item: {
            '@type': (props.mainEntityType ?? 'Thing') as 'Thing',
            name: item.name,
            url: item.url,
            ...(item.image && { image: item.image }),
            ...(item.description && { description: item.description }),
        },
    }))

    // Build the base ItemList object
    const itemList: Record<string, unknown> = {
        '@type': 'ItemList',
        itemListElement,
    }

    // Add optional properties
    if (props.name) itemList.name = props.name
    if (props.description) itemList.description = props.description
    if (props.url) itemList.url = props.url

    // Add numberOfItems if provided, otherwise calculate from elements
    itemList.numberOfItems = props.numberOfItems ?? props.itemListElement.length

    // Add item list order if provided
    if (props.itemListOrder) {
        itemList.itemListOrder =
            orderMap[props.itemListOrder] ??
            'https://schema.org/ItemListUnordered'
    }

    return withContext(itemList as unknown as ItemList)
}

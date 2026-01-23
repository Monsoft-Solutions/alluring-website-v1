/**
 * ItemList Schema Type Definition
 *
 * Used for listing pages (e.g., procedure categories, service listings)
 * to help Google understand the relationship between items.
 *
 * Can potentially enable carousel rich results (limited eligibility).
 *
 * @see https://schema.org/ItemList
 * @see https://developers.google.com/search/docs/appearance/structured-data/carousel
 */

export type ItemListElement = {
    /** Position in the list (1-indexed) */
    position: number
    /** Name of the item */
    name: string
    /** URL of the item's detail page */
    url: string
    /** Image URL for the item */
    image?: string
    /** Short description of the item */
    description?: string
}

export type ItemListSchemaProps = {
    /** Name of the list (e.g., "Plastic Surgery Procedures") */
    name?: string

    /** Description of the list */
    description?: string

    /** Number of items in the list */
    numberOfItems?: number

    /** The items in the list */
    itemListElement: ItemListElement[]

    /**
     * Order of items in the list
     * @default 'Unordered'
     */
    itemListOrder?:
        | 'Ascending'
        | 'Descending'
        | 'Unordered'
        | 'ItemListOrderAscending'
        | 'ItemListOrderDescending'
        | 'ItemListUnordered'

    /** URL of the listing page */
    url?: string

    /** Main entity type for items (e.g., 'MedicalProcedure', 'Service') */
    mainEntityType?: string
}

import type { CollectionPage, WithContext } from 'schema-dts'

import type {
    CollectionAbout,
    CollectionItem,
    CollectionPageSchemaProps,
} from '../types/schema/collection-page.type'
import { withContext } from './_internal'

/**
 * Build the about property for CollectionPage
 */
function buildAboutObject(about: CollectionAbout): Record<string, unknown> {
    const obj: Record<string, unknown> = {
        '@type': about['@type'] ?? 'Thing',
        name: about.name,
    }

    if (about.description) {
        obj.description = about.description
    }
    if (about.url) {
        obj.url = about.url
    }

    return obj
}

/**
 * Build hasPart as an ItemList for better SEO signals
 */
function buildItemList(items: CollectionItem[]): Record<string, unknown> {
    return {
        '@type': 'ItemList',
        numberOfItems: items.length,
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
                '@type': 'Article',
                url: item.url,
                name: item.name,
                // headline is same as name for Article schema compatibility
                headline: item.headline ?? item.name,
                ...(item.description && { description: item.description }),
                ...(item.image && { image: item.image }),
                ...(item.datePublished && {
                    datePublished: item.datePublished,
                }),
                // Author for E-E-A-T signals
                ...(item.author && {
                    author: { '@type': 'Person', name: item.author },
                }),
            },
        })),
    }
}

/**
 * Build CollectionPage JSON-LD schema
 *
 * Used for category and tag pages to help search engines understand
 * that this page is a collection of related content.
 *
 * @see https://schema.org/CollectionPage
 */
export function buildCollectionPageJsonLd(
    props: CollectionPageSchemaProps
): WithContext<CollectionPage> {
    const base: Record<string, unknown> = {
        '@type': 'CollectionPage',
        name: props.name,
        url: props.url,
    }

    // Add optional properties
    if (props.description) {
        base.description = props.description
    }

    if (props.about) {
        base.about = buildAboutObject(props.about)
    }

    if (props.hasPart && props.hasPart.length > 0) {
        base.hasPart = buildItemList(props.hasPart)
    }

    if (props.numberOfItems !== undefined) {
        base.numberOfItems = props.numberOfItems
    }

    if (props.publisher) {
        base.publisher = {
            '@type': 'Organization',
            name: props.publisher.name,
            ...(props.publisher.url && { url: props.publisher.url }),
            ...(props.publisher.logo && { logo: props.publisher.logo }),
        }
    }

    // Add genre to semantically differentiate category vs tag pages
    if (props.isCategory !== undefined) {
        base.genre = props.isCategory ? 'Category' : 'Tag'
    }

    return withContext(base as unknown as CollectionPage)
}

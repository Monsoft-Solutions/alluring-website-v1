import type { CollectionPage, WithContext } from 'schema-dts'

import { buildCollectionPageJsonLd } from '../../schemas/collection-page.schema'
import type { CollectionPageSchemaProps } from '../../types/schema/collection-page.type'
import { JsonLd } from '../json-ld.component'

/**
 * CollectionPage Schema Component
 *
 * Renders CollectionPage structured data for tag and category archive pages.
 * Helps search engines understand that this page aggregates related content.
 *
 * @example
 * ```tsx
 * <CollectionPageSchema
 *   url="https://example.com/blog/categories/breast-surgery"
 *   name="Breast Surgery Articles"
 *   description="Expert guides about breast augmentation, lifts, and reduction"
 *   about={{
 *     '@type': 'MedicalSpecialty',
 *     name: 'Breast Surgery',
 *     description: 'Cosmetic and reconstructive breast procedures'
 *   }}
 *   hasPart={[
 *     { url: '/article-1', name: 'Article 1', datePublished: '2024-01-01' },
 *     { url: '/article-2', name: 'Article 2', datePublished: '2024-01-02' },
 *   ]}
 * />
 * ```
 */
export function CollectionPageSchema(props: CollectionPageSchemaProps) {
    const data: WithContext<CollectionPage> = buildCollectionPageJsonLd(props)
    return <JsonLd data={data} />
}

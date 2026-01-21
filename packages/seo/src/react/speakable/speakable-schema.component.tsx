/**
 * Speakable Schema React Component
 *
 * Renders SpeakableSpecification structured data for voice search optimization.
 * This component can be used standalone or the speakable property can be
 * added directly to Article/WebPage schemas.
 *
 * @see https://schema.org/SpeakableSpecification
 * @see https://developers.google.com/search/docs/appearance/structured-data/speakable
 */
import type { SpeakableSpecification, WithContext } from 'schema-dts'

import { buildSpeakableJsonLd } from '../../schemas/speakable.schema'
import type { SpeakableSchemaProps } from '../../types/schema/speakable.type'
import { JsonLd } from '../json-ld.component'

export function SpeakableSchema(props: SpeakableSchemaProps) {
    const data: WithContext<SpeakableSpecification> =
        buildSpeakableJsonLd(props)
    return <JsonLd data={data} />
}

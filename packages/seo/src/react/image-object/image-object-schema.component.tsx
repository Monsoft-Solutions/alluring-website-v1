import type { ImageObject, WithContext } from 'schema-dts'

import { buildImageObjectJsonLd } from '../../schemas/image-object.schema'
import type { ImageObjectSchemaProps } from '../../types/schema/image-object.type'
import { JsonLd } from '../json-ld.component'

export function ImageObjectSchema(props: ImageObjectSchemaProps) {
    const data: WithContext<ImageObject> = buildImageObjectJsonLd(props)
    return <JsonLd data={data} />
}

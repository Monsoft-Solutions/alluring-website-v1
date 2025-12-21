import type { VideoObject, WithContext } from 'schema-dts'

import { buildVideoObjectJsonLd } from '../../schemas/video-object.schema'
import { JsonLd } from '../json-ld.component'
import type { VideoObjectSchemaProps } from '../../types/schema/video-object.type'

export function VideoObjectSchema(props: VideoObjectSchemaProps) {
    const data: WithContext<VideoObject> = buildVideoObjectJsonLd(props)
    return <JsonLd data={data} />
}

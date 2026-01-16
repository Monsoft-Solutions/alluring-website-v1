import type { ImageGallery, WithContext } from 'schema-dts'

import { buildImageGalleryJsonLd } from '../../schemas/image-gallery.schema'
import type { ImageGallerySchemaProps } from '../../types/schema/image-gallery.type'
import { JsonLd } from '../json-ld.component'

export function ImageGallerySchema(props: ImageGallerySchemaProps) {
    const data: WithContext<ImageGallery> = buildImageGalleryJsonLd(props)
    return <JsonLd data={data} />
}

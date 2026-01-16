import type { ImageGallery, ImageObject, WithContext } from 'schema-dts'

import type { ImageGallerySchemaProps } from '../types/schema/image-gallery.type'
import { withContext } from './_internal'

export function buildImageGalleryJsonLd(
    props: ImageGallerySchemaProps
): WithContext<ImageGallery> {
    const imageObjects: ImageObject[] = props.images.map((img) => ({
        '@type': 'ImageObject',
        url: img.url,
        name: img.name,
        description: img.description,
    }))

    const gallery: ImageGallery = {
        '@type': 'ImageGallery',
        name: props.name,
        description: props.description,
        url: props.url,
        numberOfItems: props.numberOfItems,
        image: imageObjects,
    }

    return withContext(gallery)
}

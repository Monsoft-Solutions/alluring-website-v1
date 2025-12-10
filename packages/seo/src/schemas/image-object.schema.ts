import type { ImageObject, WithContext } from 'schema-dts'

import { SCHEMA_TYPE_IMAGE_OBJECT } from '../config/schema-org.constant'
import type { ImageObjectSchemaProps } from '../types/schema/image-object.type'
import { withContext } from './_internal'

export function buildImageObjectJsonLd(
    props: ImageObjectSchemaProps
): WithContext<ImageObject> {
    const base = {
        '@type': SCHEMA_TYPE_IMAGE_OBJECT,
        url: props.url,
        contentUrl: props.contentUrl || props.url,
        thumbnailUrl: props.thumbnailUrl,
        name: props.name || props.alt,
        description: props.alt,
        caption: props.caption,
        width: props.width
            ? {
                  '@type': 'QuantitativeValue',
                  value: props.width,
                  unitCode: 'E37', // Pixel unit code
              }
            : undefined,
        height: props.height
            ? {
                  '@type': 'QuantitativeValue',
                  value: props.height,
                  unitCode: 'E37',
              }
            : undefined,
        encodingFormat: props.encodingFormat,
        representativeOfPage: props.representativeOfPage,
        author:
            typeof props.author === 'string'
                ? { '@type': 'Person', name: props.author }
                : props.author
                  ? {
                        '@type': props.author['@type'] ?? 'Person',
                        name: props.author.name,
                        url: props.author.url,
                    }
                  : undefined,
        copyrightHolder: props.copyrightHolder
            ? { '@type': 'Person', name: props.copyrightHolder }
            : undefined,
        license: props.license,
    } as ImageObject

    return withContext(base)
}

import type { VideoObject, WithContext } from 'schema-dts'

import type { VideoObjectSchemaProps } from '../types/schema/video-object.type'
import { withContext } from './_internal'

export function buildVideoObjectJsonLd(
    props: VideoObjectSchemaProps
): WithContext<VideoObject> {
    const base: VideoObject = {
        '@type': 'VideoObject',
        name: props.name,
        description: props.description,
        thumbnailUrl: props.thumbnailUrl,
        uploadDate: props.uploadDate,
        contentUrl: props.contentUrl,
        embedUrl: props.embedUrl,
        duration: props.duration,
    }

    // Add optional properties only if they exist
    if (props.width !== undefined) {
        base.width = String(props.width)
    }

    if (props.height !== undefined) {
        base.height = String(props.height)
    }

    if (props.author !== undefined) {
        if (typeof props.author === 'string') {
            base.author = { '@type': 'Person', name: props.author }
        } else {
            base.author = {
                '@type':
                    props.author.type === 'Organization'
                        ? 'Organization'
                        : 'Person',
                name: props.author.name,
                url: props.author.url,
            }
        }
    }

    if (props.transcript !== undefined) {
        base.transcript = props.transcript
    }

    return withContext(base)
}

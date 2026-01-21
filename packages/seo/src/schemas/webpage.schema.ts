import type { WebPage, WithContext } from 'schema-dts'

import type { WebPageSchemaProps } from '../types/schema/webpage.type'
import { withContext } from './_internal'
import { createSpeakableProperty } from './speakable.schema'

export function buildWebPageJsonLd(
    props: WebPageSchemaProps
): WithContext<WebPage> {
    // Build speakable property if provided
    const speakableProps = props.speakable
        ? createSpeakableProperty(props.speakable)
        : {}

    const webpage: WebPage = {
        '@type': 'WebPage',
        name: props.name,
        url: props.url,
        description: props.description,
        breadcrumb: props.breadcrumbId,
        ...(props.dateModified && { dateModified: props.dateModified }),
        ...(props.datePublished && { datePublished: props.datePublished }),
        ...speakableProps,
    }
    return withContext(webpage)
}

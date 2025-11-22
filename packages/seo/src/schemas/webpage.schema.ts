import type { WebPage, WithContext } from 'schema-dts'

import type { WebPageSchemaProps } from '../types/schema/webpage.type'
import { withContext } from './_internal'

export function buildWebPageJsonLd(
    props: WebPageSchemaProps
): WithContext<WebPage> {
    const webpage: WebPage = {
        '@type': 'WebPage',
        name: props.name,
        url: props.url,
        description: props.description,
        breadcrumb: props.breadcrumbId,
    }
    return withContext(webpage)
}

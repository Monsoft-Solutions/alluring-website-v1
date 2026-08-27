import type { WebSite, WithContext } from 'schema-dts'

import { SEARCH_INPUT_ENCODING } from '../config/schema-org.constant'
import type { WebSiteSchemaProps } from '../types/schema/website.type'
import { withContext } from './_internal'

export function buildWebSiteJsonLd(
    props: WebSiteSchemaProps
): WithContext<WebSite> {
    const website: WebSite = {
        '@type': 'WebSite',
        name: props.name,
        url: props.url,
    }

    const searchUrl = props.searchUrlTemplate
    if (searchUrl) {
        website.potentialAction = {
            '@type': 'SearchAction',
            target: searchUrl,
            // Cast to any to set hyphenated key safely, then back to type
            ...({ ['query-input']: SEARCH_INPUT_ENCODING } as Record<
                string,
                unknown
            >),
        } as unknown as WebSite['potentialAction']
    }

    return withContext(website)
}

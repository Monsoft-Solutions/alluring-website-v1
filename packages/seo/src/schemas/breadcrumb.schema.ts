import type { BreadcrumbList, ListItem, WithContext } from 'schema-dts'

import type { BreadcrumbSchemaProps } from '../types/schema/breadcrumb.type'
import { withContext } from './_internal'

export function buildBreadcrumbJsonLd(
    props: BreadcrumbSchemaProps
): WithContext<BreadcrumbList> {
    const itemListElement: ListItem[] = props.items.map((it, idx) => ({
        '@type': 'ListItem',
        position: it.position ?? idx + 1,
        name: it.name,
        item: it.item,
    }))

    const breadcrumb: BreadcrumbList = {
        '@type': 'BreadcrumbList',
        itemListElement,
    }

    return withContext(breadcrumb)
}

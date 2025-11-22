import type { BreadcrumbList, WithContext } from 'schema-dts'

import { buildBreadcrumbJsonLd } from '../../schemas/breadcrumb.schema'
import type { BreadcrumbSchemaProps } from '../../types/schema/breadcrumb.type'
import { JsonLd } from '../json-ld.component'

export function BreadcrumbSchema(props: BreadcrumbSchemaProps) {
    const data: WithContext<BreadcrumbList> = buildBreadcrumbJsonLd(props)
    return <JsonLd data={data} />
}

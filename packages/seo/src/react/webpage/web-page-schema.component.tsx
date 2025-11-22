import type { WebPage, WithContext } from 'schema-dts'

import { buildWebPageJsonLd } from '../../schemas/webpage.schema'
import type { WebPageSchemaProps } from '../../types/schema/webpage.type'
import { JsonLd } from '../json-ld.component'

export function WebPageSchema(props: WebPageSchemaProps) {
    const data: WithContext<WebPage> = buildWebPageJsonLd(props)
    return <JsonLd data={data} />
}

import type { FAQPage, WithContext } from 'schema-dts'

import { buildFAQJsonLd } from '../../schemas/faq.schema'
import type { FAQSchemaProps } from '../../types/schema/faq.type'
import { JsonLd } from '../JsonLd.component'

export function FAQSchema(props: FAQSchemaProps) {
    const data: WithContext<FAQPage> = buildFAQJsonLd(props)
    return <JsonLd data={data} />
}

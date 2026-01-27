import type { HowTo, WithContext } from 'schema-dts'

import { buildHowToJsonLd } from '../../schemas/how-to.schema'
import type { HowToSchemaProps } from '../../types/schema/how-to.type'
import { JsonLd } from '../json-ld.component'

export function HowToSchema(props: HowToSchemaProps) {
    const data: WithContext<HowTo> = buildHowToJsonLd(props)
    return <JsonLd data={data} />
}

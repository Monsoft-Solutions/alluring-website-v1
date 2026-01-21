import type { Service, WithContext } from 'schema-dts'

import { buildServiceJsonLd } from '../../schemas/service.schema'
import type { ServiceSchemaProps } from '../../types/schema/service.type'
import { JsonLd } from '../json-ld.component'

export function ServiceSchema(props: ServiceSchemaProps) {
    const data: WithContext<Service> = buildServiceJsonLd(props)
    return <JsonLd data={data} />
}

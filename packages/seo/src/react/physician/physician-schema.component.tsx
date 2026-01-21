import type { Physician, WithContext } from 'schema-dts'

import { buildPhysicianJsonLd } from '../../schemas/physician.schema'
import type { PhysicianSchemaProps } from '../../types/schema/physician.type'
import { JsonLd } from '../json-ld.component'

export function PhysicianSchema(props: PhysicianSchemaProps) {
    const data: WithContext<Physician> = buildPhysicianJsonLd(props)
    return <JsonLd data={data} />
}

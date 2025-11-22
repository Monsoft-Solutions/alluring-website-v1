import type { Organization, WithContext } from 'schema-dts'

import { buildOrganizationJsonLd } from '../../schemas/organization.schema'
import type { OrganizationSchemaProps } from '../../types/schema/organization.type'
import { JsonLd } from '../json-ld.component'

export function OrganizationSchema(props: OrganizationSchemaProps) {
    const data: WithContext<Organization> = buildOrganizationJsonLd(props)
    return <JsonLd data={data} />
}

import type { MedicalProcedure, WithContext } from 'schema-dts'

import { buildMedicalProcedureJsonLd } from '../../schemas/medical-procedure.schema'
import type { MedicalProcedureSchemaProps } from '../../types/schema/medical-procedure.type'
import { JsonLd } from '../json-ld.component'

export function MedicalProcedureSchema(props: MedicalProcedureSchemaProps) {
    const data: WithContext<MedicalProcedure> =
        buildMedicalProcedureJsonLd(props)
    return <JsonLd data={data} />
}

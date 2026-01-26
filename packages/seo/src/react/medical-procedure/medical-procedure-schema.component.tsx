import type {
    MedicalProcedure,
    SurgicalProcedure,
    WithContext,
} from 'schema-dts'

import { buildMedicalProcedureJsonLd } from '../../schemas/medical-procedure.schema'
import type { MedicalProcedureSchemaProps } from '../../types/schema/medical-procedure.type'
import { JsonLd } from '../json-ld.component'

/**
 * MedicalProcedure/SurgicalProcedure Schema Component
 *
 * Renders JSON-LD structured data for medical procedures.
 * Use schemaType='SurgicalProcedure' for surgical procedures
 * for better semantic classification in Google.
 *
 * @see https://schema.org/MedicalProcedure
 * @see https://schema.org/SurgicalProcedure
 */
export function MedicalProcedureSchema(props: MedicalProcedureSchemaProps) {
    const data: WithContext<MedicalProcedure | SurgicalProcedure> =
        buildMedicalProcedureJsonLd(props)
    return <JsonLd data={data} />
}

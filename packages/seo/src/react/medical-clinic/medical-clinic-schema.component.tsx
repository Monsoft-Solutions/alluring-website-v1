import type { MedicalBusiness, MedicalClinic, WithContext } from 'schema-dts'

import { buildMedicalClinicJsonLd } from '../../schemas/medical-clinic.schema'
import type { MedicalClinicSchemaProps } from '../../types/schema/medical-clinic.type'
import { JsonLd } from '../json-ld.component'

/**
 * MedicalBusiness/MedicalClinic Schema Component
 *
 * Renders JSON-LD structured data for a medical business or clinic.
 * This is a more specific type than LocalBusiness and signals
 * to Google that this is a healthcare facility.
 *
 * By default uses MedicalBusiness type which is more appropriate for
 * private practices. Use schemaType="MedicalClinic" for facilities
 * associated with hospitals or medical schools.
 *
 * Benefits:
 * - Better categorization in Google's Knowledge Graph
 * - Eligible for healthcare-specific SERP features
 * - Supports medicalSpecialty and availableService properties
 * - Can include isAcceptingNewPatients property
 * - Uses @id for stable entity identification
 *
 * @see https://schema.org/MedicalBusiness
 * @see https://schema.org/MedicalClinic
 */
export function MedicalClinicSchema(props: MedicalClinicSchemaProps) {
    const data: WithContext<MedicalBusiness | MedicalClinic> =
        buildMedicalClinicJsonLd(props)
    return <JsonLd data={data} />
}

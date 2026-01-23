import type {
    MedicalProcedure,
    SurgicalProcedure,
    WithContext,
} from 'schema-dts'

import type { MedicalProcedureSchemaProps } from '../types/schema/medical-procedure.type'
import { withContext } from './_internal'

/**
 * Builds JSON-LD structured data for a MedicalProcedure or SurgicalProcedure
 *
 * Used for plastic surgery procedure pages to enhance Google understanding
 * and enable rich results for medical content.
 *
 * SurgicalProcedure is a more specific subtype for surgical procedures,
 * providing better semantic classification for surgical content.
 *
 * @see https://schema.org/MedicalProcedure
 * @see https://schema.org/SurgicalProcedure
 */
export function buildMedicalProcedureJsonLd(
    props: MedicalProcedureSchemaProps
): WithContext<MedicalProcedure | SurgicalProcedure> {
    // Normalize image to array if provided
    const imageArray = props.image
        ? Array.isArray(props.image)
            ? props.image
            : [props.image]
        : undefined

    // Determine the schema type - default to MedicalProcedure
    const schemaType = props.schemaType ?? 'MedicalProcedure'

    // Build the base procedure object
    // Note: Some schema.org properties are added via spread to work around schema-dts limitations
    const procedure = {
        '@type': schemaType,
        name: props.name,
        description: props.description,
        ...(props.howPerformed && { howPerformed: props.howPerformed }),
        ...(props.preparation && { preparation: props.preparation }),
        ...(props.followup && { followup: props.followup }),
        ...(props.bodyLocation && { bodyLocation: props.bodyLocation }),
        ...(imageArray && { image: imageArray }),
        ...(props.mainEntityOfPage && {
            mainEntityOfPage: props.mainEntityOfPage,
        }),
        ...(props.url && { url: props.url }),
        ...(props.procedureType && {
            procedureType: props.procedureType,
        }),
        ...(props.status && { status: props.status }),
        ...(props.dateModified && { dateModified: props.dateModified }),
        ...(props.datePublished && { datePublished: props.datePublished }),
        // Handle performedBy for Knowledge Graph entity linking
        ...(props.performedBy && {
            performedBy: {
                '@type': props.performedBy.type ?? 'Organization',
                ...(props.performedBy['@id'] && {
                    '@id': props.performedBy['@id'],
                }),
                name: props.performedBy.name,
            },
        }),
    } as MedicalProcedure | SurgicalProcedure

    return withContext(procedure)
}

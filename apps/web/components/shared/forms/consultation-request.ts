/**
 * What `ConsultationForm` sends for its fields, in either variant — kept out
 * of the component so the request every compact entry point builds can be
 * tested on its own (#350).
 *
 * The compact form has no last name: the request leaves `lastName` out and
 * the full name has no trailing space. Every request carries
 * `SUBMIT_CONSENT`: the form shows the consent notice above its button.
 */

import { SUBMIT_CONSENT } from '@/lib/constants/lead-consent'
import {
    type ConsultationFormCompactInput,
    PROCEDURE_OPTIONS,
} from '@/lib/types/forms/contact-form.type'

/** Either form's fields: the full form's input is the compact's, narrowed. */
export function buildConsultationRequest(data: ConsultationFormCompactInput) {
    const procedureLabel = PROCEDURE_OPTIONS.find(
        (option) => option.value === data.procedure
    )?.label
    const firstName = data.firstName.trim()
    const lastName = data.lastName?.trim() || undefined
    return {
        ...data,
        firstName,
        lastName,
        ...SUBMIT_CONSENT,
        // Combined for the `name` column (backward compatibility).
        name: [firstName, lastName].filter(Boolean).join(' '),
        subject: data.procedure
            ? `Consultation Request: ${procedureLabel || data.procedure}`
            : 'Consultation Request',
    }
}

/**
 * Which contact fields each form source must send. Lives outside the route
 * so it can be tested on its own (route files may only export handlers).
 *
 * @module lib/utils/validate-contact-by-source.util
 */
import {
    CONTACT_SOURCES,
    type ContactFormData,
} from '@/lib/types/forms/contact-form.type'

/**
 * Validates data based on the form source
 * Different forms have different required fields
 */
export function validateBySource(data: ContactFormData): {
    valid: boolean
    error?: string
} {
    const source = data.source || CONTACT_SOURCES.GENERAL

    switch (source) {
        // The contact, specials and home pages use the chat thread (#274),
        // which asks for a mobile number only; email is optional afterwards.
        // So does Dr. Karlinsky's bio-link page (#332), on one screen, and
        // the BMI calculator page since its rebuild (#346).
        case CONTACT_SOURCES.CONTACT_PAGE:
        case CONTACT_SOURCES.SPECIALS_PAGE:
        case CONTACT_SOURCES.HOME_PAGE:
        case CONTACT_SOURCES.BLOG_LEAD:
        case CONTACT_SOURCES.EXIT_INTENT:
        case CONTACT_SOURCES.LEAD_FORM:
        case CONTACT_SOURCES.DR_KARLINSKY_IG:
        case CONTACT_SOURCES.BMI_CALCULATOR:
            // Lead capture forms require phone
            if (!data.phone) {
                return { valid: false, error: 'Phone number is required' }
            }
            break

        // The home and Atelier hero forms are the compact ConsultationForm,
        // which asks for a phone and no email: requiring one turned every
        // send into a 400 (#350).
        case CONTACT_SOURCES.CONTACT_HERO:
        case CONTACT_SOURCES.FOOTER:
        case CONTACT_SOURCES.GENERAL:
        default:
            // General form: at least email or phone must be provided
            if (!data.email && !data.phone) {
                return {
                    valid: false,
                    error: 'Please provide either an email or phone number',
                }
            }
            break
    }

    return { valid: true }
}

/**
 * Validation for the /lp/request-consultation consultation form.
 *
 * The rules are the site's own: the same phone and email schemas every other
 * form runs, and that `/api/contact` runs again on the server. The messages
 * here are never shown. The shared schemas hardcode English and this page is
 * bilingual, so the form displays each field's error from the copy deck in the
 * current language (`LpDictionary['form']['errors']`). That also means a
 * language switch retranslates errors already on screen without re-validating.
 *
 * Required fields match the Loquent form this replaced: first name, last name
 * and phone. Email is optional but must be valid when given. Consent is
 * required.
 */
import { z } from 'zod'

import {
    emailSchema,
    requiredPhoneSchema,
} from '@/lib/types/forms/contact-form.type'

/** Fails whenever `schema` rejects the value. */
function delegatingString(schema: z.ZodType, message: string) {
    return z.string().superRefine((value, ctx) => {
        if (!schema.safeParse(value).success) {
            ctx.addIssue({ code: 'custom', message })
        }
    })
}

export const lpFormSchema = z.object({
    firstName: z.string().trim().min(1, 'First name is required.'),
    lastName: z.string().trim().min(1, 'Last name is required.'),
    phone: delegatingString(requiredPhoneSchema, 'Invalid US phone number.'),
    email: delegatingString(emailSchema, 'Invalid email address.'),
    procedure: z.string(),
    consentGiven: z.boolean().refine((given) => given, 'Consent is required.'),
    // Honeypot. `/api/contact` fakes a success when this is filled.
    _website: z.string(),
})

export type LpFormValues = z.input<typeof lpFormSchema>

/** The fields whose errors the form displays from the copy deck. */
export type LpFormErrorField = 'firstName' | 'lastName' | 'phone' | 'email'

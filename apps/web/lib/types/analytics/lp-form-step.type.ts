/**
 * What the ads landing page's form sends to `/api/lp/step` for each answer
 * (#292), and the check the route runs on it. Every field is a closed set or
 * a short slug, so nothing free-text — and nothing that identifies anyone —
 * can reach the table.
 */

import { z } from 'zod'

import { LP_FORM_VARIANTS } from '@/components/landing-pages/request-consultation/lp-form-variant'
import { LP_SECTIONS } from '@/components/landing-pages/request-consultation/lp-sections'
import { AD_VARIANTS } from '@/components/landing-pages/request-consultation/lp-variants'

/** Where an answer was given; see `ConsultFlowAnswer.entry`. */
export const LP_STEP_ENTRY_POINTS = [
    'hero',
    'bar',
    'closing',
    'strip',
    'link',
] as const

const slug = z
    .string()
    .max(40)
    .regex(/^[a-z0-9][a-z0-9-]*$/)

export const lpFormStepPayloadSchema = z.object({
    tab: z.string().regex(/^[a-z0-9]{8,40}$/),
    page: slug,
    form: z.enum(LP_FORM_VARIANTS),
    ad: z.enum(AD_VARIANTS),
    section: z.enum(LP_SECTIONS).nullable(),
    lang: z.enum(['en', 'es']),
    step: z.enum(['procedure', 'timeline']),
    answer: slug,
    entry: z.enum(LP_STEP_ENTRY_POINTS),
})

export type LpFormStepPayload = z.infer<typeof lpFormStepPayloadSchema>

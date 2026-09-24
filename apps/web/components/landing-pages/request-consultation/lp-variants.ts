/**
 * Ad-group variants for /lp/request-consultation.
 *
 * One landing page serves every ad group; `?p=<variant>` swaps the headline,
 * the lede, the page title, the procedure preselected in the thread, and
 * which before/after pair leads the results rail.
 *
 * Since v5 (#290) each headline says what the visitor searched: the first
 * line names the procedure and Miami, and the second repeats the ad group's
 * own promise, so the click lands where the ad said it would. On a phone the
 * lede is hidden, so the headline has to carry that on its own.
 *
 * No variant carries a payment amount, an APR or a term (see the REGISTER
 * note in `lp-copy.ts`); the thread gives the settled starting price once she
 * names the procedure. The surgeon is named as an MD rather than "double
 * board-certified" (see `karlinsky-credentials.constant.ts`), and nothing here
 * claims a facility accreditation.
 */

import { KARLINSKY_NAME } from '@/lib/data/surgeons/karlinsky-credentials.constant'
import type { PROCEDURE_OPTIONS } from '@/lib/types/forms/contact-form.type'

import { LP_COPY, type LpLang } from './lp-copy'

export const AD_VARIANTS = [
    'default',
    'bbl',
    'mommy-makeover',
    'breast-augmentation',
    'breast-lift',
    'breast-reduction',
    'tummy-tuck',
    'liposuction',
    'skin-removal',
    'second-opinion',
] as const

export type AdVariant = (typeof AD_VARIANTS)[number]

/**
 * Spellings that appear in live ad URLs and in hand-typed links. Kept
 * generous on purpose: a mistyped `?p=` should degrade to the right variant,
 * not to `default`.
 */
const VARIANT_ALIASES: Readonly<Record<string, AdVariant>> = {
    lipo: 'liposuction',
    'lipo-360': 'liposuction',
    lipo360: 'liposuction',
    'liposuction-360': 'liposuction',
    mommy: 'mommy-makeover',
    mm: 'mommy-makeover',
    mommymakeover: 'mommy-makeover',
    breast: 'breast-augmentation',
    boobs: 'breast-augmentation',
    baug: 'breast-augmentation',
    breastaugmentation: 'breast-augmentation',
    breastlift: 'breast-lift',
    mastopexy: 'breast-lift',
    reduction: 'breast-reduction',
    breastreduction: 'breast-reduction',
    tt: 'tummy-tuck',
    tummytuck: 'tummy-tuck',
    abdominoplasty: 'tummy-tuck',
    'brazilian-butt-lift': 'bbl',
    skin: 'skin-removal',
    skinremoval: 'skin-removal',
    'loose-skin': 'skin-removal',
    'weight-loss': 'skin-removal',
    'post-weight-loss': 'skin-removal',
    secondopinion: 'second-opinion',
    compare: 'second-opinion',
    competitor: 'second-opinion',
    competitors: 'second-opinion',
}

/** Resolves `?p=` / `?procedure=` to a variant, falling back to `default`. */
export function resolveAdVariant(raw: string | null | undefined): AdVariant {
    const key = (raw ?? '').toLowerCase().trim()
    if (!key) return 'default'
    const aliased = VARIANT_ALIASES[key] ?? key
    return AD_VARIANTS.includes(aliased as AdVariant)
        ? (aliased as AdVariant)
        : 'default'
}

/**
 * A procedure value the site's contact system stores — the same slugs every
 * other consultation form writes to `contact_submission.procedure`.
 */
export type LpProcedureValue = Exclude<
    (typeof PROCEDURE_OPTIONS)[number]['value'],
    ''
>

/**
 * The procedure preselected in the thread for each ad group. `''` preselects
 * nothing: skin removal has no chip of its own, and a visitor comparing
 * surgeons could be asking about anything. Typed against the site's
 * procedure slugs, so a value the contact system does not know fails the
 * typecheck instead of silently not preselecting.
 */
export const VARIANT_PROCEDURE: Readonly<
    Record<AdVariant, LpProcedureValue | ''>
> = {
    default: '',
    bbl: 'bbl',
    'mommy-makeover': 'mommy-makeover',
    'breast-augmentation': 'breast-augmentation',
    'breast-lift': 'breast-lift',
    'breast-reduction': 'breast-reduction',
    'tummy-tuck': 'tummy-tuck',
    liposuction: 'liposuction',
    'skin-removal': '',
    'second-opinion': '',
}

export interface VariantCopy {
    /** The page title's first half: "Tummy Tuck in Miami". */
    readonly title: string
    /** First line of the h1: the procedure and Miami, as searched. */
    readonly headline: string
    /** Second line, set in italic display type: the ad group's promise. */
    readonly headlineEm: string
    /** Under the headline on wider screens; hidden on phones. */
    readonly lede: string
}

const en: Record<AdVariant, VariantCopy> = {
    default: {
        title: 'Plastic Surgery Consultation in Miami',
        headline: 'Plastic surgery in Miami,',
        headlineEm: 'planned around you.',
        lede: `${KARLINSKY_NAME}, plans and performs your surgery herself. One all-inclusive price, in writing, with financing available.`,
    },
    bbl: {
        title: 'BBL in Miami',
        headline: 'BBL in Miami,',
        headlineEm: 'planned for your frame.',
        lede: 'Ultrasound-guided, as Florida law requires, by a surgeon with 1,500+ BBLs performed. Your all-inclusive price in writing, with financing available.',
    },
    'mommy-makeover': {
        title: 'Mommy Makeover in Miami',
        headline: 'Mommy makeover in Miami.',
        headlineEm: 'One surgery. One recovery.',
        lede: `Tummy, breasts and lipo planned as one operation by ${KARLINSKY_NAME}, with a week-by-week recovery plan you can arrange childcare around.`,
    },
    'breast-augmentation': {
        title: 'Breast Augmentation in Miami',
        headline: 'Breast augmentation in Miami.',
        headlineEm: 'Natural, and your choice.',
        lede: 'Silicone, saline or fat transfer. You choose size and shape with the surgeon who operates, not a salesperson.',
    },
    'breast-lift': {
        title: 'Breast Lift in Miami',
        headline: 'Breast lift in Miami.',
        headlineEm: 'With or without implants.',
        lede: `${KARLINSKY_NAME}, tells you whether a lift alone or a lift with implants suits you, and puts the plan and the price in writing.`,
    },
    'breast-reduction': {
        title: 'Breast Reduction in Miami',
        headline: 'Breast reduction in Miami.',
        headlineEm: 'Lighter, and in proportion.',
        lede: `Smaller, lifted breasts that fit your frame, planned by ${KARLINSKY_NAME}, with your price and your recovery plan in writing.`,
    },
    'tummy-tuck': {
        title: 'Tummy Tuck in Miami',
        headline: 'Tummy tuck in Miami.',
        headlineEm: 'Loose skin out, muscles repaired.',
        lede: `One surgery by ${KARLINSKY_NAME}, with a week-by-week recovery plan in writing before you pick a date.`,
    },
    liposuction: {
        title: 'Lipo 360 in Miami',
        headline: 'Lipo 360 in Miami.',
        headlineEm: 'Waist, back and flanks in one.',
        lede: `Stubborn fat removed and your waist defined by ${KARLINSKY_NAME}, who plans and performs your surgery herself.`,
    },
    'skin-removal': {
        title: 'Skin Removal in Miami',
        headline: 'Skin removal in Miami.',
        headlineEm: 'For the body you worked for.',
        lede: `After major weight loss, ${KARLINSKY_NAME}, plans your arm, thigh or tummy lift, with the price and every date in writing.`,
    },
    'second-opinion': {
        title: 'Second Opinion in Miami',
        headline: 'Comparing Miami surgeons?',
        headlineEm: 'Get a second opinion, in writing.',
        lede: `Bring the quote you already have. ${KARLINSKY_NAME}, tells you if you’re a candidate, who operates and what’s included, all in writing.`,
    },
}

const es: Record<AdVariant, VariantCopy> = {
    default: {
        title: 'Consulta de cirugía plástica en Miami',
        headline: 'Cirugía plástica en Miami,',
        headlineEm: 'planificada para ti.',
        lede: `La Dra. ${KARLINSKY_NAME} planifica y realiza tu cirugía ella misma. Un solo precio todo incluido, por escrito, con financiamiento disponible.`,
    },
    bbl: {
        title: 'BBL en Miami',
        headline: 'BBL en Miami,',
        headlineEm: 'planificado para tu cuerpo.',
        lede: 'Guiado por ultrasonido, como exige la ley de Florida, por una cirujana con más de 1,500 BBL realizados. Tu precio todo incluido por escrito, con financiamiento disponible.',
    },
    'mommy-makeover': {
        title: 'Mommy Makeover en Miami',
        headline: 'Mommy makeover en Miami.',
        headlineEm: 'Una cirugía. Una recuperación.',
        lede: `Abdomen, senos y lipo planificados como una sola operación por la Dra. ${KARLINSKY_NAME}, con un plan de recuperación semana a semana para organizar el cuidado de tus hijos.`,
    },
    'breast-augmentation': {
        title: 'Aumento de senos en Miami',
        headline: 'Aumento de senos en Miami.',
        headlineEm: 'Natural, y a tu elección.',
        lede: 'Silicona, solución salina o transferencia de grasa. El tamaño y la forma los eliges con la cirujana que opera, no con un vendedor.',
    },
    'breast-lift': {
        title: 'Levantamiento de senos en Miami',
        headline: 'Levantamiento de senos en Miami.',
        headlineEm: 'Con o sin implantes.',
        lede: `La Dra. ${KARLINSKY_NAME} te dice si te conviene solo el levantamiento o el levantamiento con implantes, y te da el plan y el precio por escrito.`,
    },
    'breast-reduction': {
        title: 'Reducción de senos en Miami',
        headline: 'Reducción de senos en Miami.',
        headlineEm: 'Más ligera, y en proporción.',
        lede: `Senos más pequeños y levantados, en proporción con tu cuerpo, planificados por la Dra. ${KARLINSKY_NAME}, con tu precio y tu plan de recuperación por escrito.`,
    },
    'tummy-tuck': {
        title: 'Abdominoplastia en Miami',
        headline: 'Abdominoplastia en Miami.',
        headlineEm: 'Sin piel sobrante, con el músculo reparado.',
        lede: `Una sola cirugía por la Dra. ${KARLINSKY_NAME}, con un plan de recuperación semana a semana por escrito antes de elegir la fecha.`,
    },
    liposuction: {
        title: 'Lipo 360 en Miami',
        headline: 'Lipo 360 en Miami.',
        headlineEm: 'Cintura, espalda y flancos en una.',
        lede: `Grasa localizada eliminada y la cintura definida por la Dra. ${KARLINSKY_NAME}, que planifica y realiza tu cirugía ella misma.`,
    },
    'skin-removal': {
        title: 'Retiro de piel sobrante en Miami',
        headline: 'Retiro de piel sobrante en Miami.',
        headlineEm: 'Para el cuerpo que te ganaste.',
        lede: `Después de una gran pérdida de peso, la Dra. ${KARLINSKY_NAME} planifica tu levantamiento de brazos, muslos o abdomen, con el precio y cada fecha por escrito.`,
    },
    'second-opinion': {
        title: 'Segunda opinión en Miami',
        headline: '¿Comparando cirujanos en Miami?',
        headlineEm: 'Pide una segunda opinión, por escrito.',
        lede: `Trae la cotización que ya tienes. La Dra. ${KARLINSKY_NAME} te dice si eres candidata, quién opera y qué incluye, todo por escrito.`,
    },
}

export const AD_VARIANT_COPY: Readonly<
    Record<LpLang, Record<AdVariant, VariantCopy>>
> = { en, es }

/** "Tummy Tuck in Miami · Financing Available | Alluring Plastic Surgery". */
export function lpTitle(lang: LpLang, adVariant: AdVariant): string {
    return LP_COPY[lang].meta.title.replace(
        '{title}',
        AD_VARIANT_COPY[lang][adVariant].title
    )
}

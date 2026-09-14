/**
 * Ad-group variants for /lp/request-consultation.
 *
 * One landing page serves every ad group; `?p=<variant>` swaps the headline,
 * the lede, the procedure preselected in the form, and which before/after pair
 * leads the results grid.
 *
 * The hero photograph is not part of a variant — there is no hero photograph.
 * Neither is a price: no variant carries a weekly payment, an APR or a "from"
 * figure. See the REGISTER note in `lp-copy.ts`; the argument every variant
 * makes is the surgeon's judgment and an accredited facility, not the cost of
 * entry.
 */

import type { LpLang } from './lp-copy'

export const AD_VARIANTS = [
    'default',
    'bbl',
    'mommy-makeover',
    'breast-augmentation',
    'tummy-tuck',
    'liposuction',
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
    tt: 'tummy-tuck',
    tummytuck: 'tummy-tuck',
    abdominoplasty: 'tummy-tuck',
    'brazilian-butt-lift': 'bbl',
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
 * The value written into the form's "Procedure of Interest" select.
 *
 * These are Loquent option values, not display copy — they stay in English in
 * both languages because that is how the form is configured. Changing one here
 * without changing it in Loquent silently stops the preselect from matching.
 */
export const VARIANT_PROCEDURE: Readonly<Record<AdVariant, string>> = {
    default: '',
    bbl: 'Brazilian Butt Lift (BBL)',
    'mommy-makeover': 'Mommy Makeover',
    'breast-augmentation': 'Breast Augmentation',
    'tummy-tuck': 'Tummy Tuck',
    liposuction: 'Liposuction / Lipo 360',
}

export interface VariantCopy {
    /** First line of the h1. */
    readonly headline: string
    /** Second line, set in italic display type. */
    readonly headlineEm: string
    readonly lede: string
}

const en: Record<AdVariant, VariantCopy> = {
    default: {
        headline: 'Refined. Never obvious.',
        headlineEm: 'Begin with a private consultation.',
        lede: 'A double board-certified surgeon, an accredited operating facility, and every figure and date in writing before you decide anything.',
    },
    bbl: {
        headline: 'The Miami BBL, done properly.',
        headlineEm: '1,500+ performed by Dr. Karlinsky.',
        lede: 'Ultrasound-guided technique, in an AAAASF-accredited facility, with board-certified anesthesiologists. Nothing about it is improvised.',
    },
    'mommy-makeover': {
        headline: 'Your body, after children.',
        headlineEm: 'One surgery. One recovery. One plan.',
        lede: 'Tummy tuck, breast lift or augmentation, and liposuction, planned as a single operation by a double board-certified surgeon.',
    },
    'breast-augmentation': {
        headline: 'Fuller. Still unmistakably you.',
        headlineEm: 'Nothing that announces itself.',
        lede: 'Silicone, saline or fat transfer. You settle the size with the surgeon who operates, not with a salesperson.',
    },
    'tummy-tuck': {
        headline: 'A flat, considered result.',
        headlineEm: 'Loose skin, resolved.',
        lede: 'A tummy tuck by a double board-certified surgeon, with a written week-by-week recovery plan before you commit to a date.',
    },
    liposuction: {
        headline: 'Lipo 360, in Miami.',
        headlineEm: 'The waist training won’t give you.',
        lede: 'Stubborn fat removed and the waist defined, by a double board-certified surgeon in an accredited facility.',
    },
}

const es: Record<AdVariant, VariantCopy> = {
    default: {
        headline: 'Refinado. Nunca evidente.',
        headlineEm: 'Empieza con una consulta privada.',
        lede: 'Una cirujana con doble certificación, una clínica acreditada y cada cifra y cada fecha por escrito antes de que decidas nada.',
    },
    bbl: {
        headline: 'El BBL de Miami, bien hecho.',
        headlineEm: 'Más de 1,500 por la Dra. Karlinsky.',
        lede: 'Técnica guiada por ultrasonido, en una clínica acreditada AAAASF y con anestesiólogos certificados. Aquí nada se improvisa.',
    },
    'mommy-makeover': {
        headline: 'Tu cuerpo, después de los hijos.',
        headlineEm: 'Una cirugía. Una recuperación. Un plan.',
        lede: 'Abdominoplastia, levantamiento o aumento de senos y lipo, planificados como una sola operación por una cirujana con doble certificación.',
    },
    'breast-augmentation': {
        headline: 'Con más volumen. Inconfundiblemente tú.',
        headlineEm: 'Nada que se anuncie solo.',
        lede: 'Silicona, solución salina o transferencia de grasa. El tamaño lo defines con la cirujana que opera, no con un vendedor.',
    },
    'tummy-tuck': {
        headline: 'Un abdomen plano y definido.',
        headlineEm: 'La piel suelta, resuelta.',
        lede: 'Abdominoplastia por una cirujana con doble certificación, con un plan de recuperación semana a semana por escrito antes de fijar la fecha.',
    },
    liposuction: {
        headline: 'Lipo 360, en Miami.',
        headlineEm: 'La cintura que el gimnasio no te da.',
        lede: 'Grasa localizada eliminada y la cintura definida, por una cirujana con doble certificación en una clínica acreditada.',
    },
}

export const AD_VARIANT_COPY: Readonly<
    Record<LpLang, Record<AdVariant, VariantCopy>>
> = { en, es }

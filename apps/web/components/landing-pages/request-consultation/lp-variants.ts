/**
 * Ad-group variants for /lp/request-consultation.
 *
 * One landing page serves every ad group; `?p=<variant>` swaps the headline,
 * the lede, the financing line, the procedure preselected in the form, and
 * which before/after pair leads the results grid.
 *
 * The hero photograph is NOT part of a variant any more. The page ships one
 * commissioned hero (the champagne/penthouse frame) for every ad group, so the
 * crop lives in landing.css rather than being written onto the element here.
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
    /** The financing chip beside the trust row. */
    readonly financing: string
}

const en: Record<AdVariant, VariantCopy> = {
    default: {
        headline: 'Feel like yourself again.',
        headlineEm: 'Start with a free consultation.',
        lede: 'Join 5,000+ women who chose Alluring. Double board-certified surgeons, your all-inclusive price in writing, financing from $27/week.',
        financing: 'From $27/week · 0% APR available*',
    },
    bbl: {
        headline: 'The Miami BBL, done safely.',
        headlineEm: '1,500+ BBLs by Dr. Karlinsky.',
        lede: 'Ultrasound-guided technique, AAAASF-accredited facility, board-certified anesthesiologists. Free consultation, financing from $45/week.',
        financing: 'From $45/week · 0% APR available*',
    },
    'mommy-makeover': {
        headline: 'Get your body back after kids.',
        headlineEm: 'One surgery. One recovery. One plan.',
        lede: 'Tummy tuck, breast lift or augmentation, and lipo, planned together by a double board-certified surgeon. Free consultation, financing from $27/week.',
        financing: 'From $27/week · 0% APR available*',
    },
    'breast-augmentation': {
        headline: 'Breast augmentation that still looks like you.',
        headlineEm: 'Just fuller.',
        lede: 'Silicone, saline or fat transfer. You choose the size with your surgeon, not a salesperson. Free consultation, financing from $27/week.',
        financing: 'From $27/week · 0% APR available*',
    },
    'tummy-tuck': {
        headline: 'A flat, tight tummy.',
        headlineEm: 'Loose skin gone for good.',
        lede: 'Tummy tuck by a double board-certified surgeon, with a written week-by-week recovery plan before you book. Free consultation, financing from $27/week.',
        financing: 'From $27/week · 0% APR available*',
    },
    liposuction: {
        headline: 'Lipo 360 in Miami.',
        headlineEm: 'The waist the gym won’t give you.',
        lede: 'Stubborn fat removed and curves defined by a double board-certified surgeon. Free consultation, financing from $27/week.',
        financing: 'From $27/week · 0% APR available*',
    },
}

const es: Record<AdVariant, VariantCopy> = {
    default: {
        headline: 'Vuelve a sentirte tú.',
        headlineEm: 'Empieza con una consulta gratis.',
        lede: 'Más de 5,000 mujeres eligieron Alluring. Cirujanos con doble certificación, precio todo incluido por escrito y financiamiento desde $27/semana.',
        financing: 'Desde $27/semana · 0% APR disponible*',
    },
    bbl: {
        headline: 'El BBL de Miami, hecho con seguridad.',
        headlineEm: 'Más de 1,500 BBL por la Dra. Karlinsky.',
        lede: 'Técnica guiada por ultrasonido, clínica acreditada AAAASF y anestesiólogos certificados. Consulta gratis, financiamiento desde $45/semana.',
        financing: 'Desde $45/semana · 0% APR disponible*',
    },
    'mommy-makeover': {
        headline: 'Recupera tu cuerpo después de los hijos.',
        headlineEm: 'Una cirugía. Una recuperación. Un plan.',
        lede: 'Abdominoplastia, levantamiento o aumento de senos y lipo, planificados juntos por una cirujana con doble certificación. Consulta gratis, financiamiento desde $27/semana.',
        financing: 'Desde $27/semana · 0% APR disponible*',
    },
    'breast-augmentation': {
        headline: 'Aumento de senos que sigue pareciendo tú.',
        headlineEm: 'Solo con más volumen.',
        lede: 'Silicona, solución salina o transferencia de grasa. Eliges el tamaño con tu cirujana, no con un vendedor. Consulta gratis, financiamiento desde $27/semana.',
        financing: 'Desde $27/semana · 0% APR disponible*',
    },
    'tummy-tuck': {
        headline: 'Un abdomen plano y firme.',
        headlineEm: 'Adiós a la piel suelta.',
        lede: 'Abdominoplastia por una cirujana con doble certificación, con un plan de recuperación semana a semana por escrito antes de reservar. Consulta gratis, financiamiento desde $27/semana.',
        financing: 'Desde $27/semana · 0% APR disponible*',
    },
    liposuction: {
        headline: 'Lipo 360 en Miami.',
        headlineEm: 'La cintura que el gimnasio no te da.',
        lede: 'Grasa localizada eliminada y curvas definidas por una cirujana con doble certificación. Consulta gratis, financiamiento desde $27/semana.',
        financing: 'Desde $27/semana · 0% APR disponible*',
    },
}

export const AD_VARIANT_COPY: Readonly<
    Record<LpLang, Record<AdVariant, VariantCopy>>
> = { en, es }

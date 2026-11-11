/**
 * The before-and-after photos on /lp/request-consultation that load only
 * after the visitor taps "Show photos" (`lp-photo-gate.component.tsx`).
 *
 * Read on the server only: by the page, to know whether a view has a card,
 * and by the `photos` route the card fetches. No client component imports
 * this file, so these addresses are not in the page's HTML, its props or its
 * JavaScript until the visitor asks for them.
 *
 * `LP_PHOTO_GATE_OFF` (comma-separated views, empty by default) turns the
 * card off for those views: no card renders and the route returns nothing.
 */

import type { LpResultPhoto } from './lp-assets'
import { AD_VARIANTS, type AdVariant } from './lp-variants'

const GALLERY =
    'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/gallery'

function photo(id: string, procedure: string, file: string): LpResultPhoto {
    return { id, procedure, src: `${GALLERY}/${file}` }
}

/** Photos 01–09 as they are in the gallery, whole and side by side. */
export const LP_GATED_PHOTO_SET = {
    '01': photo(
        '01',
        'bbl',
        'alluring-plastic-surgery-brazilian-butt-lift-karli-1765751221006-00nvl1.jpg'
    ),
    '02': photo(
        '02',
        'mommy-makeover',
        'alluring-plastic-surgery-mommy-makeover-karlinsky--1765753727423-xtjrtj.jpg'
    ),
    '03': photo(
        '03',
        'breast-augmentation',
        'karlinsky-baug-01-1765746207585-0h7pzx.jpg'
    ),
    '05': photo(
        '05',
        'liposuction',
        'alluring-plastic-surgery-liposuction-karlinsky-05-1765751441763-tsrqp1.jpg'
    ),
    '06': photo(
        '06',
        'bbl',
        'alluring-plastic-surgery-brazilian-butt-lift-karli-1765751221426-2ca6g0.jpg'
    ),
    '07': photo(
        '07',
        'mommy-makeover',
        'alluring-plastic-surgery-mommy-makeover-karlinsky--1765753725798-tub34s.jpg'
    ),
    '08': photo(
        '08',
        'mommy-makeover',
        'alluring-plastic-surgery-mommy-makeover-karlinsky--1765753727813-vatbg0.jpg'
    ),
    '09': photo(
        '09',
        'liposuction',
        'alluring-plastic-surgery-liposuction-karlinsky-04-1765751441581-bwh2vu.jpg'
    ),
} as const satisfies Record<string, LpResultPhoto>

export type LpGatedId = keyof typeof LP_GATED_PHOTO_SET

const ALL: readonly LpGatedId[] = [
    '01',
    '02',
    '03',
    '05',
    '06',
    '07',
    '08',
    '09',
]

/** Each view's photos behind the card, in order. */
export const LP_GATED_IDS: Readonly<Record<AdVariant, readonly LpGatedId[]>> = {
    default: ALL,
    'second-opinion': ALL,
    'mommy-makeover': ['02', '07', '08'],
    'tummy-tuck': ['02', '08'],
    liposuction: ['05', '09', '08'],
    'skin-removal': ['02', '08'],
    bbl: ['01', '06'],
    'breast-augmentation': ['03'],
    'breast-lift': [],
    'breast-reduction': [],
}

/** `"liposuction, tummy-tuck"` → the views whose card is off. Unknown names are ignored. */
export function parsePhotoGateOff(
    raw: string | null | undefined
): ReadonlySet<AdVariant> {
    const views = (raw ?? '')
        .split(',')
        .map((part) => part.trim().toLowerCase())
        .filter((part): part is AdVariant =>
            AD_VARIANTS.includes(part as AdVariant)
        )
    return new Set(views)
}

/** The photos behind a view's card, or none when its card is off. */
export function gatedPhotosFor(
    view: AdVariant,
    off: ReadonlySet<AdVariant>
): readonly LpResultPhoto[] {
    if (off.has(view)) return []
    return LP_GATED_IDS[view].map((id) => LP_GATED_PHOTO_SET[id])
}

/** Whether a view shows the tap-to-view card. */
export function hasPhotoGate(
    view: AdVariant,
    off: ReadonlySet<AdVariant>
): boolean {
    return gatedPhotosFor(view, off).length > 0
}

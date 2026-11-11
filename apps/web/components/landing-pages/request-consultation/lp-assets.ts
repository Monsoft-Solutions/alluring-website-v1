/**
 * Every image on /lp/request-consultation, in one place.
 *
 * The before/after pairs come from the same Vercel Blob store the rest of the
 * site uses, so they are swappable without a deploy. The logo,
 * portrait and certification badges are already in `public/`, so they are
 * referenced locally rather than through the live site's optimizer the way the
 * standalone HTML prototype had to.
 */

import type { AdVariant } from './lp-variants'

const BLOB = 'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com'

export const LP_LOGO = {
    src: '/logo.png',
    width: 400,
    height: 166,
} as const

export const LP_SURGEON_PORTRAIT = {
    src: '/images/surgeons/dr-karlinsky.webp',
    width: 800,
    height: 1000,
} as const

/**
 * What a shared link to the ads page or its thank-you page previews with:
 * the surgeon's portrait, in place of the site-wide share image.
 */
export const LP_SURGEON_SHARE_IMAGE = {
    url: '/images/surgeons/dr-karlinsky-og.png',
    width: 800,
    height: 1000,
} as const

export interface LpBadge {
    readonly src: string
    readonly alt: string
    readonly width: number
    readonly height: number
}

export const LP_BADGES: readonly LpBadge[] = [
    {
        src: '/images/certifications/abcs-fellowship-director.png',
        alt: 'American Board of Cosmetic Surgery, Fellowship Director',
        width: 657,
        height: 581,
    },
    {
        src: '/images/certifications/abs-board-certified.png',
        alt: 'American Board of Surgery, Board Certified',
        width: 1713,
        height: 424,
    },
    {
        src: '/images/certifications/abfcs-board-certified.png',
        alt: 'American Board of Facial Cosmetic Surgery, Board Certified',
        width: 748,
        height: 748,
    },
    {
        src: '/images/certifications/aacs-fellow.png',
        alt: 'American Academy of Cosmetic Surgery, Fellow',
        width: 401,
        height: 385,
    },
]

/**
 * Before/after pairs, in their default order. The ad variant moves its own
 * procedure to the front; the fifth is hidden by CSS unless it gets promoted.
 * Keys match the `AdVariant` slugs so the promotion is a lookup, not a map.
 */
export const LP_BEFORE_AFTER: readonly {
    readonly procedure: string
    readonly src: string
}[] = [
    {
        procedure: 'bbl',
        src: `${BLOB}/gallery/alluring-plastic-surgery-brazilian-butt-lift-karli-1765751221006-00nvl1.jpg`,
    },
    {
        procedure: 'mommy-makeover',
        src: `${BLOB}/gallery/alluring-plastic-surgery-mommy-makeover-karlinsky--1765753727423-xtjrtj.jpg`,
    },
    {
        procedure: 'breast-augmentation',
        src: `${BLOB}/gallery/karlinsky-baug-01-1765746207585-0h7pzx.jpg`,
    },
    {
        procedure: 'tummy-tuck',
        src: `${BLOB}/gallery/alluring-plastic-surgery-tummy-tuck-karlinsky-01-1765751851798-jx2hz3.jpg`,
    },
    {
        procedure: 'liposuction',
        src: `${BLOB}/gallery/alluring-plastic-surgery-liposuction-karlinsky-05-1765751441763-tsrqp1.jpg`,
    },
]

/**
 * A before-and-after on the ads page's results rail. `id` is the photo's
 * number (01–09); a `c` marks an abdomen-only crop of that photo, saved as
 * its own file with the before above the after.
 */
export interface LpResultPhoto {
    readonly id: string
    /** The ad-group slug, for the caption in the visitor's language. */
    readonly procedure: string
    readonly src: string
    /** True when the before sits above the after rather than beside it. */
    readonly stacked?: boolean
}

/** The abdomen crops live in the app's own Blob store, under `lp/open/`. */
const LP_OPEN_BLOB =
    'https://sarpxxbehh1ep7ka.public.blob.vercel-storage.com/lp/open'

const TUMMY_TUCK_04: LpResultPhoto = {
    id: '04',
    procedure: 'tummy-tuck',
    src: `${BLOB}/gallery/alluring-plastic-surgery-tummy-tuck-karlinsky-01-1765751851798-jx2hz3.jpg`,
}
const MOMMY_MAKEOVER_02C: LpResultPhoto = {
    id: '02c',
    procedure: 'mommy-makeover',
    src: `${LP_OPEN_BLOB}/mommy-makeover-abdomen-02-a01a3388.jpg`,
    stacked: true,
}
const LIPO_05C: LpResultPhoto = {
    id: '05c',
    procedure: 'liposuction',
    src: `${LP_OPEN_BLOB}/lipo-360-abdomen-05-dcf826b2.jpg`,
    stacked: true,
}
const MOMMY_MAKEOVER_08C: LpResultPhoto = {
    id: '08c',
    procedure: 'mommy-makeover',
    src: `${LP_OPEN_BLOB}/mommy-makeover-abdomen-08-42324954.jpg`,
    stacked: true,
}

/**
 * The photos each view of /lp/request-consultation shows in the page, in
 * order. The rest of the results load only after the visitor taps the card
 * under them (`lp-gated-photos.ts`, read on the server). Both languages show
 * the same photos.
 */
export const LP_OPEN_PHOTOS: Readonly<
    Record<AdVariant, readonly LpResultPhoto[]>
> = {
    default: [TUMMY_TUCK_04, MOMMY_MAKEOVER_08C, LIPO_05C],
    'second-opinion': [TUMMY_TUCK_04, MOMMY_MAKEOVER_08C, LIPO_05C],
    'mommy-makeover': [MOMMY_MAKEOVER_08C, MOMMY_MAKEOVER_02C, TUMMY_TUCK_04],
    'tummy-tuck': [TUMMY_TUCK_04, MOMMY_MAKEOVER_08C, MOMMY_MAKEOVER_02C],
    liposuction: [LIPO_05C, MOMMY_MAKEOVER_08C],
    'skin-removal': [TUMMY_TUCK_04, MOMMY_MAKEOVER_02C, MOMMY_MAKEOVER_08C],
    bbl: [],
    'breast-augmentation': [],
    'breast-lift': [],
    'breast-reduction': [],
}

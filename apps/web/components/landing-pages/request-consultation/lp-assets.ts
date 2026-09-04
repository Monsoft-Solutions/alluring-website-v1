/**
 * Every image on /lp/request-consultation, in one place.
 *
 * The before/after pairs come from the same Vercel Blob store the rest of the
 * site uses, so they are swappable without a deploy. The logo,
 * portrait and certification badges are already in `public/`, so they are
 * referenced locally rather than through the live site's optimizer the way the
 * standalone HTML prototype had to.
 */

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

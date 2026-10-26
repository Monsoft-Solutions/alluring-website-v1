/**
 * Every image on /lp/request-consultation, in one place.
 *
 * The before/after pairs come from the same Vercel Blob store the rest of the
 * site uses, so they are swappable without a deploy. The logo,
 * portrait and credential badges are already in `public/`, so they are
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

/**
 * The verified credentials only (claims canon §2): the American Board of
 * Surgery and the American College of Surgeons. The ABCS and ABFCS badges
 * need the Florida statement at the same type size, which a logo strip cannot
 * carry, and the AACS "Fellow" and ABCS "Fellowship Director" badges are
 * unverified, so none of them is shown.
 */
export const LP_BADGES: readonly LpBadge[] = [
    {
        src: '/images/certifications/abs-board-certified.png',
        alt: 'Board certified by the American Board of Surgery',
        width: 1713,
        height: 424,
    },
    {
        src: '/images/certifications/facs-fellow.svg',
        alt: 'Fellow, American College of Surgeons',
        width: 237,
        height: 74,
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

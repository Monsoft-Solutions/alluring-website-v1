/**
 * Shared values for the home page's sections: the consultation thread's id,
 * the section ids `SectionViewTracker` reports, the page's media and the
 * procedures its links name.
 *
 * @module
 */

/**
 * The consultation thread's section id. It matches the contact page's, so a
 * visitor who starts the thread here and opens /contact-us (or the other way
 * round) finds their answers waiting: the thread keeps them per id in
 * `sessionStorage`.
 */
export const HOME_CHAT_ID = 'start-consultation'

/** Ids of the page's sections, in page order. `section_view` reports them. */
export const HOME_SECTION_IDS = {
    hero: 'hero',
    proof: 'proof',
    consult: 'consult',
    results: 'results',
    picker: 'find-your-procedure',
    surgeon: 'surgeon',
    prices: 'prices',
    flyIn: 'fly-in',
    reviews: 'reviews',
    faq: 'faq',
    close: 'next-step',
} as const

/**
 * The page's generated media (GPT Image 2.5 stills, Seedance 2.5 films), on
 * Vercel Blob, as `put()` returned them; the render job id is in each name so
 * a replacement never fights a cached copy. Each poster is its film's first
 * frame and each film ends where it starts, so the poster-to-film crossfade
 * and the loop have nothing to hide. Every person in them is a model.
 */
export const HOME_MEDIA = {
    heroPosterDesktop:
        'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/home/2026-09/hero-desktop-poster-ce75df29.webp',
    heroPosterMobile:
        'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/home/2026-09/hero-mobile-poster-b5df53b1.webp',
    heroVideoDesktop:
        'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/home/2026-09/hero-desktop-ce75df29.mp4',
    heroVideoMobile:
        'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/home/2026-09/hero-mobile-b5df53b1.mp4',
    figure: 'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/home/2026-09/figure-line-crop-55175bdc.webp',
    closeDesktop:
        'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/home/2026-09/close-desktop-7b21d55f.webp',
    closeMobile:
        'https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/home/2026-09/close-mobile-b3094b80.webp',
} as const

/**
 * The number each section wears in its eyebrow: the page reads as one
 * guided path, from the first question to the last.
 */
export const HOME_SECTION_INDEX = {
    consult: '01',
    results: '02',
    picker: '03',
    surgeon: '04',
    prices: '05',
    flyIn: '06',
    reviews: '07',
    faq: '08',
} as const satisfies Partial<Record<keyof typeof HOME_SECTION_IDS, string>>

/** Where the practice's generated imagery says so. */
export const MODEL_DISCLOSURE = 'Model shown. Not a patient.'

/**
 * Florida Rule 64B8-11.001(1)(g): an advertised fee must disclose the
 * variables that change it. Stated wherever a "from" price appears.
 */
export const PRICE_VARIABLES =
    'Starting prices. Yours depends on the areas treated, your body and any procedures combined, and your surgeon confirms it at consultation.'

/** The page's content width. */
export const homeContainer = 'mx-auto w-full max-w-[78rem] px-5 md:px-8'

/**
 * A section's H2: Bodoni Moda at display size, tight, with the one word
 * that carries the feeling set in italic (`<em>`, styled in home-page.css).
 */
export const homeHeading =
    'hp-display text-[2.75rem] leading-[0.98] tracking-[-0.02em] text-balance md:text-[4rem] lg:text-[4.75rem]'

/** A section's lead paragraph. */
export const homeLead =
    'text-[1.0625rem] leading-[1.65] text-pretty md:text-[1.1875rem]'

/**
 * The primary button: ink on porcelain, champagne on the dark bands
 * (`hp-btn--light`). 17:1 and 12:1. The arrow is drawn by the CSS.
 */
export const homePrimaryButton = 'hp-btn'

/** The primary button on a dark band. */
export const homePrimaryButtonOnDark = 'hp-btn hp-btn--light'

/** A quiet text link with a bronze hairline under it. */
export const homeLink = 'hp-link'

/**
 * Procedures the page links to: their page, and the consultation thread's
 * value for them (`site-chat-copy.ts`).
 */
export const HOME_PROCEDURES = {
    lipo: {
        name: 'Lipo 360',
        href: '/procedures/liposuction-miami',
        chat: 'liposuction',
    },
    bbl: {
        name: 'BBL',
        href: '/procedures/brazilian-butt-lift-bbl-miami',
        chat: 'bbl',
    },
    tummy: {
        name: 'Tummy tuck',
        href: '/procedures/tummy-tuck-miami',
        chat: 'tummy-tuck',
    },
    mommy: {
        name: 'Mommy makeover',
        href: '/procedures/mommy-makeover-miami',
        chat: 'mommy-makeover',
    },
    breast: {
        name: 'Breast augmentation',
        href: '/procedures/breast-augmentation-miami',
        chat: 'breast-augmentation',
    },
    face: {
        name: 'Facelift',
        href: '/procedures/facelift-miami',
        chat: 'facelift',
    },
    weightLoss: {
        name: 'body contouring after weight loss',
        href: '/after-weight-loss-consultation',
        chat: 'multiple',
    },
} as const

export type HomeProcedureKey = keyof typeof HOME_PROCEDURES

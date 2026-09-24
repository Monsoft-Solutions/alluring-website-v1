/**
 * Shared values for the home page's sections: the consultation thread's id,
 * the section ids `SectionViewTracker` reports, the page's media and the
 * procedures its links name.
 *
 * @module
 */

import { cn } from '@workspace/ui/lib/utils'

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

/** Where the practice's generated imagery says so. */
export const MODEL_DISCLOSURE = 'Model shown. Not a patient.'

/**
 * Florida Rule 64B8-11.001(1)(g): an advertised fee must disclose the
 * variables that change it. Stated wherever a "from" price appears.
 */
export const PRICE_VARIABLES =
    'Starting prices. Yours depends on the areas treated, your body and any procedures combined, and your surgeon confirms it at consultation.'

/** The page's content width. */
export const homeContainer = 'mx-auto w-full max-w-[76rem] px-5 md:px-8'

/** Eyebrow above a section heading: a dark gold that holds 5:1 on ivory. */
export const homeEyebrow =
    'text-[0.75rem] font-bold tracking-[0.2em] text-[#7d6311] uppercase'

/** A section's H2. */
export const homeHeading =
    'font-serif text-[2.35rem] leading-[1.02] tracking-[-0.015em] text-balance md:text-[3.5rem] lg:text-[4.25rem]'

/** The primary button: ink on gold. 8.1:1, as on the procedure pages. */
export const homePrimaryButton = cn(
    'inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6',
    'from-gold-300 via-gold-400 to-gold-500 bg-gradient-to-br text-[0.9375rem] font-bold text-stone-950',
    'shadow-[0_18px_40px_-18px_rgba(180,148,31,0.8)] transition-transform duration-300 hover:-translate-y-0.5',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500'
)

/** A quiet text link with an animated underline. */
export const homeLink =
    'font-bold underline decoration-gold-400 decoration-2 underline-offset-[6px] transition-colors hover:decoration-stone-900'

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

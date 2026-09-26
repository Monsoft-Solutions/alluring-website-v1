/**
 * Every string the v2 blog post template adds around a post (epic #293,
 * #295 · S5). The post's own text is never touched; this is the only file
 * with the template's copy, so a copy review reads one file.
 *
 * English only: Google Translate translates the page. The consultation
 * thread is `translate="no"` and switches itself to Spanish, so the strings
 * it owns (the offer bubble, the sticky bar's label) carry Spanish too.
 *
 * No reviewer claims, board claims, patient counts or travel arrangements:
 * the blog has no medical reviewer, and the practice confirms dates and
 * nights in Miami, not flights or hotels.
 *
 * @module components/blog/post-page/post-page.copy
 */
import type { PostProcedure } from '@/lib/blog/post-procedure.util'
import type { ReaderStage } from '@/lib/blog/reader-stage.util'
import { siteConfig } from '@/lib/data/site-config'

/**
 * The consultation thread's id. Every link to it must be exactly
 * `#post-consult`: the thread only answers for links with that `href`.
 */
export const POST_CONSULT_ID = 'post-consult'

/** The closing band's id, which the sticky bar steps aside for. */
export const POST_CLOSE_ID = 'post-close'

/** "lipo" → "Lipo". Names already capitalised ("BBL") are unchanged. */
export function capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1)
}

/** A heading with the one phrase set in italic. */
export type SplitHeading = { readonly lead: string; readonly em: string }

/** The thread's heading block, by what the reader came for. */
export function threadCopy(
    procedure: PostProcedure | null,
    stage: ReaderStage
): { eyebrow: string; heading: SplitHeading; lead: string } {
    const lead =
        'Many of our patients fly in from other states. We confirm your surgery and follow-up dates in writing, and tell you how many nights to stay in Miami.'

    if (!procedure) {
        return {
            eyebrow: 'Free consultation',
            heading: { lead: 'Your price and plan, ', em: 'in writing.' },
            lead,
        }
    }

    const short = procedure.shortName
    return stage === 'recovering'
        ? {
              eyebrow: `Planning your ${short}?`,
              heading: {
                  lead: 'Your price and recovery plan, ',
                  em: 'in writing.',
              },
              lead,
          }
        : {
              eyebrow: `${capitalize(short)} at Alluring`,
              heading: { lead: `Get your ${short} price, `, em: 'in writing.' },
              lead,
          }
}

/** The label of every link that takes the reader to the thread. */
export function priceCta(procedure: PostProcedure | null): string {
    return procedure
        ? `Get my ${procedure.shortName} price`
        : 'Start my free consultation'
}

/** The sticky bar's label; the bar is `translate="no"`, so it carries both. */
export function stickyLabel(procedure: PostProcedure | null): {
    en: string
    es: string
} {
    return procedure
        ? { en: priceCta(procedure), es: 'Recibir mi precio' }
        : { en: priceCta(null), es: 'Empezar mi consulta gratis' }
}

/** The strip's chips. */
export const STRIP_COPY = {
    listLabel: (procedure: PostProcedure) =>
        `${capitalize(procedure.shortName)} at Alluring in brief`,
    price: (price: NonNullable<PostProcedure['price']>) =>
        `${price.label} starting at ${price.startingAt}`,
    recoveryLabel: 'Typical recovery: ',
    rating: (rating: number, count: number) =>
        `${rating.toFixed(1)} · ${count} Google reviews`,
} as const

/** The offer bubble in the thread, as on the specials page. */
export const OFFER_COPY = {
    en: (endsOn: string) =>
        `Ends ${endsOn}. Your coordinator confirms how it applies to your plan.`,
    es: (endsOn: string) =>
        `Termina el ${endsOn}. Tu coordinadora confirma cómo aplica a tu plan.`,
} as const

/** How a photo caption names the procedure: "After a BBL", "After lipo". */
const PHOTO_NOUN: Readonly<Record<string, string>> = {
    bbl: 'a BBL',
    liposuction: 'liposuction',
    'tummy-tuck': 'a tummy tuck',
    'mommy-makeover': 'a mommy makeover',
    'breast-augmentation': 'breast augmentation',
    'breast-lift': 'a breast lift',
    'breast-reduction': 'a breast reduction',
    facelift: 'a facelift',
    blepharoplasty: 'eyelid surgery',
}

/** The results rail, for one procedure. */
export function resultsCopy(procedure: PostProcedure) {
    const short = procedure.shortName
    const noun = PHOTO_NOUN[procedure.chatValue] ?? short
    return {
        question: `What do real ${short} results look like?`,
        answer: `These are photos of real Alluring patients after ${noun}, shared with their consent. Results differ from person to person, and your surgeon talks you through what is realistic for your body at your free consultation, before you decide anything.`,
        railLabel: `${capitalize(short)} before and after photos from the gallery`,
        galleryLinkLabel: `See every ${short} photo in the gallery`,
        realPatientsNote: 'Photos in this section are real Alluring patients.',
        caption: (isBeforeAndAfter: boolean) =>
            isBeforeAndAfter ? `Before and after ${noun}` : `After ${noun}`,
    }
}

/** The surgeon card. */
export const SURGEON_COPY = {
    heading: { lead: 'Meet your ', em: 'surgeon' } as SplitHeading,
    profileLink: 'More about Dr. Karlinsky',
} as const

/** The FAQ fallback's heading, for posts whose FAQ lives only in the data. */
export const FAQ_HEADING = 'Frequently asked questions'

/**
 * The closing band. Its heading is the practice's tagline, "Personal care.
 * Honest price.", with the second sentence in italic.
 */
export function closeCopy(procedure: PostProcedure | null) {
    const tagline =
        siteConfig.business.tagline ?? 'Personal care. Honest price.'
    const [first = '', ...rest] = tagline.split(/(?<=\.)\s+/)
    return {
        eyebrow: 'Start here',
        heading: { lead: `${first} `, em: rest.join(' ') } as SplitHeading,
        body: 'Your price, surgery date and follow-up plan, in writing, before you book a flight.',
        primary: priceCta(procedure),
    }
}

/** The desktop fact card, for the procedures with a settled price. */
export function railCopy(procedure: PostProcedure) {
    return {
        label: `${capitalize(procedure.shortName)} at Alluring`,
        bookLabel: priceCta(procedure),
    }
}

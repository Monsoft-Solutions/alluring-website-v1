import Link from 'next/link'
import type { ReactNode } from 'react'

export type GalleryPageCopy = {
    /** `<title>`, 60 characters at most. */
    title: string
    /** Meta description, 155 characters at most. */
    description: string
    /** The H1, in the words people search. */
    heading: string
    /** Replaces the group's description under the H1. */
    intro: ReactNode
}

const introLink =
    'decoration-gold-500 text-stone-900 underline underline-offset-4'

/**
 * Hand-written copy for a gallery that people search for by name. Galleries
 * without an entry keep their generated title and the group's description.
 *
 * "breast lift before and after" has about 33,100 searches a month (Keyword
 * Planner, 3 Nov 2026) and this gallery ranks about 62, so its title and H1
 * use those words.
 */
export const GALLERY_PAGE_COPY: Record<string, GalleryPageCopy> = {
    'breast-lift': {
        title: 'Breast Lift Before and After: Real Patient Photos, Miami',
        description:
            'Real breast lift before and after photos from Alluring Plastic Surgery in Miami, with and without implants, and what to look for in each one.',
        heading: 'Breast Lift Before and After',
        intro: (
            <>
                <p>
                    These are photos of real Alluring patients, shared with
                    their consent. Some had a breast lift on its own and some
                    had it with implants or another procedure, and many of the
                    photos say which. For the rest, ask at your consultation.
                    Results differ from person to person.
                </p>
                <p>
                    Look at where the nipple sits and how the upper part of the
                    breast looks, and ask how much time had passed since
                    surgery, because the shape keeps settling for months. Then
                    compare{' '}
                    <Link
                        href='/blog/breast-lift-implants-miami'
                        className={introLink}
                    >
                        a lift with implants
                    </Link>{' '}
                    and{' '}
                    <Link
                        href='/blog/breast-lift-without-implants'
                        className={introLink}
                    >
                        a lift without implants
                    </Link>
                    , see{' '}
                    <Link
                        href='/blog/types-of-breast-lift'
                        className={introLink}
                    >
                        the types of breast lift
                    </Link>{' '}
                    and read how{' '}
                    <Link
                        href='/blog/breast-lift-scars-miami'
                        className={introLink}
                    >
                        breast lift scars fade
                    </Link>
                    .
                </p>
            </>
        ),
    },
}

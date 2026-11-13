import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { ImplantSizeCalculatorLazy } from '@/components/calculators/implant-size/implant-size-calculator-lazy.component'
import { selectResultPhotos } from '@/components/procedures/module-kit/module-results.component'
import { breastAugmentationFigure } from '@/lib/data/procedures/facts/breast-augmentation.facts'
import { siteConfig } from '@/lib/data/site-config'
import type { ProcedureGalleryData } from '@/lib/queries/gallery/procedure-galleries.query'

import { POST_CONSULT_ID } from './post-page.copy'

/** What a post's intro block may draw on, from the page's own data. */
export type PostIntroContext = {
    /** The gallery of the post's procedure, when it has one. */
    gallery: ProcedureGalleryData | null
}

/**
 * Blocks the v2 template puts before a post's first H2, keyed on the slug.
 *
 * They live in code, never in the post's stored markdown: the autopilot
 * refresh loop rewrites post bodies and would drop or mangle them. Only the
 * slugs listed here render their block, and each block's client code is an
 * async chunk (`React.lazy`), so no other post downloads it.
 *
 * - `breast-implant-size-guide`: ranks around position 2 for "breast implant
 *   size calculator" (Search Console, 27 Sep to 9 Oct 2026, ~24 impressions a
 *   day, no clicks): the searcher wants a tool, so the post gets one. Since
 *   #382 the result can be sent to the reader's phone, the panel says whose
 *   calculator it is, and real results sit right under it: most readers of
 *   this post are new to the practice, outside Florida, and leave before the
 *   results band further down.
 */
const POST_INTRO_BLOCKS: Readonly<
    Record<string, (context: PostIntroContext) => ReactNode>
> = {
    'breast-implant-size-guide': ({ gallery }) => (
        <ImplantSizeCalculatorLazy
            consultHref={`#${POST_CONSULT_ID}`}
            consultProcedure='breast-augmentation'
            consultEntry='calculator'
            practiceNote={<SizeGuidePracticeNote />}
        >
            {gallery && <SizeGuideResults gallery={gallery} />}
        </ImplantSizeCalculatorLazy>
    ),
}

/**
 * Whether a post's intro block asks for the reader's details itself. The
 * sticky consultation bar then steps aside while the block is on screen
 * (`POST_INTRO_ID`) instead of floating a second ask over its form.
 */
export function postIntroHasForm(slug: string): boolean {
    return slug === 'breast-implant-size-guide'
}

/** The block for this post's intro, or null for every other post. */
export function getPostIntroBlock(
    slug: string,
    context: PostIntroContext
): ReactNode {
    return POST_INTRO_BLOCKS[slug]?.(context) ?? null
}

const noteLink =
    'text-gold-300 hover:text-gold-200 font-semibold underline underline-offset-[0.25em]'

/**
 * Whose calculator this is and what the surgery costs there: the practice's
 * two published breast augmentation prices, read from the facts file the
 * procedure page uses, so the two can't drift apart.
 */
function SizeGuidePracticeNote() {
    return (
        <>
            <p>
                At {siteConfig.business.name} in Miami, breast augmentation
                starts at {breastAugmentationFigure('price-saline')} with saline
                implants and {breastAugmentationFigure('price-silicone')} with
                silicone.{' '}
                <Link
                    href='/procedures/breast-augmentation-miami'
                    className={noteLink}
                >
                    See the prices and what to ask
                </Link>
            </p>
            <p className='mt-2'>
                In another state?{' '}
                <Link href='/fly-in-consultation' className={noteLink}>
                    Start with a virtual consultation
                </Link>
            </p>
        </>
    )
}

/** Photos shown under the calculator. */
const RESULT_PHOTOS = 3

/**
 * Three of the gallery's breast augmentation photos, right under the result.
 * The full rail stays further down the page (`PostResults`); few readers of
 * this post get that far. Renders nothing when the gallery has no photo that
 * names the procedure.
 */
function SizeGuideResults({ gallery }: { gallery: ProcedureGalleryData }) {
    const photos = selectResultPhotos(
        gallery.media,
        'breast-augmentation-miami'
    ).slice(0, RESULT_PHOTOS)
    if (photos.length === 0) return null

    return (
        <div className='mt-7'>
            <h3 className='font-serif text-[1.375rem] leading-[1.2] font-normal text-stone-900'>
                What real results <em className='italic'>look like</em>
            </h3>
            <p className='mt-1.5 text-[0.9375rem] leading-[1.55] text-stone-600'>
                Real Alluring patients after breast augmentation, shared with
                their consent. Results differ from person to person.
            </p>
            <ul
                aria-label='Breast augmentation photos from the gallery'
                className='mt-4 grid grid-cols-3 gap-2 sm:gap-3'
                data-copy-check='data'
            >
                {photos.map((photo) => (
                    <li key={photo.id}>
                        <Link
                            href={`/gallery/media/${photo.slug}`}
                            data-cta='calculator_result_photo'
                            className='relative block aspect-[4/5] overflow-hidden rounded-xl bg-white ring-1 ring-stone-200'
                        >
                            <Image
                                src={photo.url}
                                alt={photo.alt}
                                fill
                                sizes='(min-width: 768px) 210px, 30vw'
                                className='object-contain'
                            />
                        </Link>
                    </li>
                ))}
            </ul>
            {gallery.groupSlug && (
                <Link
                    href={`/gallery/${gallery.groupSlug}`}
                    data-cta='calculator_gallery'
                    className='decoration-gold-500 mt-4 inline-flex min-h-11 items-center gap-2 text-[0.9375rem] font-semibold text-stone-900 underline underline-offset-[0.3em] hover:decoration-current'
                >
                    See every breast augmentation photo{' '}
                    <span aria-hidden='true'>→</span>
                </Link>
            )}
        </div>
    )
}

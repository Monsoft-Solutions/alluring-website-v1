import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'

import { BeforeAfterSlider } from '@/components/gallery/before-after-slider.component'
import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'
import type { BeforeAfterPairCard } from '@/lib/types/gallery/before-after.type'
import type { GalleryMediaCard } from '@/lib/types/gallery/gallery-group.type'
import { mentionsProcedure } from '@/lib/procedures/procedure-mentions'

import { ModuleRailButtons } from './module-rail-buttons.component'
import { moduleContainer, moduleLink } from './module-ui.constant'

/** Gallery alt text that describes a side-by-side before and after photo. */
export const BEFORE_AND_AFTER = /before[\s-]and[\s-]after/i

/**
 * The gallery's photos of one procedure for the results rail: images only,
 * each one naming the procedure in its title or alt text (a group can hold
 * photos of other procedures), before-and-after photos first, then the rest
 * in the gallery's own order.
 *
 * The Instagram import saves a carousel post's cover as `<code>-primary` and
 * again as `<code>-carousel-0`, so the two are one photo.
 */
export function selectResultPhotos(
    media: GalleryMediaCard[],
    procedureSlug: string
): GalleryMediaCard[] {
    const seen = new Set<string>()
    const photos = media.filter((item) => {
        if (item.type !== 'image') return false
        if (!mentionsProcedure(procedureSlug, `${item.title} ${item.alt}`)) {
            return false
        }
        const key = item.url.replace(/-carousel-0(\.\w+)$/, '-primary$1')
        if (seen.has(key)) return false
        seen.add(key)
        return true
    })
    const beforeAfter = photos.filter((item) => BEFORE_AND_AFTER.test(item.alt))
    return [
        ...beforeAfter,
        ...photos.filter((item) => !beforeAfter.includes(item)),
    ]
}

type ModuleResultsProps = {
    pair?: BeforeAfterPairCard
    photos: GalleryMediaCard[]
    gallerySlug: string | null
    /** The section's H2, phrased as the question people search. */
    question: string
    /** The 40–60-word answer under it. */
    answer: string
    /** The rail's id, which its buttons control. */
    railId: string
    /** Names the rail for assistive technology. */
    railLabel: string
    /** The link to the procedure's gallery group. */
    galleryLinkLabel: string
    /** An honest caption for each photo, e.g. "Before and after a BBL". */
    captionOf: (photo: GalleryMediaCard) => string
}

/**
 * Before and after: real patients only. The before/after pair leads with its
 * slider; the gallery's other photos of the procedure follow in a rail that
 * bleeds to the edge of the screen, swiped on phones and stepped with buttons
 * from `lg`. Each photo opens its own gallery page.
 *
 * Renders nothing when the gallery has neither, and the page drops its jump
 * link, so the section never promises photos it doesn't show.
 *
 * It follows the hero, so it renders straight away: `content-visibility`
 * only pays off below the fold, and this near the top it would only shift
 * the layout.
 */
export function ModuleResults({
    pair,
    photos,
    gallerySlug,
    question,
    answer,
    railId,
    railLabel,
    galleryLinkLabel,
    captionOf,
}: ModuleResultsProps) {
    if (!pair && photos.length === 0) return null

    return (
        <div className='bg-stone-50'>
            <AnswerBlock
                id='results'
                question={question}
                className={cn(moduleContainer, 'pt-12 pb-10 md:pt-24 md:pb-14')}
                answer={answer}
            >
                <div
                    className={cn(
                        'mt-10 grid gap-6 md:mt-12',
                        pair &&
                            photos.length > 0 &&
                            'lg:grid-cols-[24rem_minmax(0,1fr)] lg:gap-8'
                    )}
                >
                    {pair && (
                        <div className='w-full max-w-[30rem] lg:max-w-none'>
                            <BeforeAfterSlider
                                pair={pair}
                                hideProcedureTypePill
                            />
                        </div>
                    )}
                    {photos.length > 0 && (
                        <ul
                            id={railId}
                            aria-label={railLabel}
                            className='pm-rail'
                        >
                            {photos.map((photo) => (
                                <li
                                    key={photo.id}
                                    className='w-[min(78vw,20rem)] lg:w-[24rem]'
                                >
                                    <figure>
                                        <Link
                                            href={`/gallery/media/${photo.slug}`}
                                            className='pm-rail-frame relative block aspect-[4/5] overflow-hidden rounded-xl bg-white ring-1 ring-stone-200'
                                        >
                                            <Image
                                                src={photo.url}
                                                alt={photo.alt}
                                                fill
                                                sizes='(min-width: 1024px) 384px, (min-width: 410px) 320px, 78vw'
                                                className='object-contain'
                                            />
                                        </Link>
                                        <figcaption className='mt-3 text-[0.9375rem] leading-normal text-stone-600'>
                                            {captionOf(photo)}
                                        </figcaption>
                                    </figure>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className='mt-8 flex items-end justify-between gap-6'>
                    <div className='flex max-w-[34rem] flex-col gap-4 text-[0.9375rem] leading-[1.55] text-stone-600'>
                        <p>
                            Photos in this section are real patients. Images
                            elsewhere on the page that show a model are labeled
                            as such.
                        </p>
                        {gallerySlug && (
                            <Link
                                href={`/gallery/${gallerySlug}`}
                                className={cn(
                                    moduleLink,
                                    'text-base font-bold'
                                )}
                            >
                                {galleryLinkLabel}
                            </Link>
                        )}
                    </div>
                    {photos.length > 1 && (
                        <ModuleRailButtons
                            railId={railId}
                            className='hidden shrink-0 lg:flex'
                        />
                    )}
                </div>
            </AnswerBlock>
        </div>
    )
}

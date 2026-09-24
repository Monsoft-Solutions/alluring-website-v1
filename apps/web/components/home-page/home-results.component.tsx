import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'

import type { GalleryImage } from '@/lib/types/gallery/gallery.type'

import {
    HOME_SECTION_IDS,
    homeContainer,
    homeHeading,
} from './home-page.constant'

/** Gallery group for each procedure page the specials query draws from. */
const GALLERY_SLUGS: Record<string, string> = {
    'brazilian-butt-lift-bbl-miami': 'brazilian-butt-lift',
    'breast-augmentation-miami': 'breast-augmentation',
    'mommy-makeover-miami': 'mommy-makeover',
    'liposuction-miami': 'liposuction',
    'tummy-tuck-miami': 'tummy-tuck',
}

const MAX_PHOTOS = 12

const VIDEO_URL = /\.(mp4|mov|m4v|webm)(\?|$)/i

/**
 * The rail's order: the procedures home visitors ask about most, leading
 * with the least revealing photographs, so the first card of a home page
 * isn't a close-up.
 */
const PROCEDURE_ORDER = [
    'mommy-makeover-miami',
    'liposuction-miami',
    'tummy-tuck-miami',
    'brazilian-butt-lift-bbl-miami',
    'breast-augmentation-miami',
]

/**
 * Interleave the photos by procedure, one of each in `PROCEDURE_ORDER` and
 * then round again, so the first screen of the rail shows range rather than
 * three of one procedure.
 */
function interleave(images: GalleryImage[]): GalleryImage[] {
    const byProcedure = new Map<string, GalleryImage[]>(
        PROCEDURE_ORDER.map((slug) => [slug, []])
    )
    for (const image of images) {
        const list = byProcedure.get(image.procedureSlug) ?? []
        list.push(image)
        byProcedure.set(image.procedureSlug, list)
    }
    const queues = [...byProcedure.values()]
    const out: GalleryImage[] = []
    while (out.length < images.length) {
        for (const queue of queues) {
            const next = queue.shift()
            if (next) out.push(next)
        }
    }
    return out
}

type HomeResultsProps = {
    images: GalleryImage[]
}

/**
 * Results, where the visitor who came to check us out looks first: the
 * gallery was the page they most often went to next (234 of 1,948 home
 * visitors in 90 days), and only 15% of phone visitors ever scrolled far
 * enough to reach the old page's gallery.
 *
 * A dark band that opens to full width as it arrives, then a rail of the
 * gallery's photos, each scaling up as it slides into view. Photos are shown
 * whole (`object-contain`): a before-and-after pair cropped to fill a frame
 * loses half of its point.
 */
export function HomeResults({ images }: HomeResultsProps) {
    // The gallery query returns Instagram videos too, and `next/image`
    // renders a video URL as an empty frame.
    const stills = images.filter((image) => !VIDEO_URL.test(image.url))
    if (stills.length === 0) return null
    const photos = interleave(stills).slice(0, MAX_PHOTOS)

    return (
        <section
            id={HOME_SECTION_IDS.results}
            aria-labelledby='results-title'
            className='hp-scene hp-defer overflow-hidden bg-stone-900 py-16 text-stone-100 md:py-28'
        >
            <div className={homeContainer}>
                <div className='flex flex-wrap items-end justify-between gap-6'>
                    <div className='max-w-[40rem]'>
                        <p className='text-gold-300 text-[0.75rem] font-bold tracking-[0.2em] uppercase'>
                            Real results
                        </p>
                        <h2
                            id='results-title'
                            className={cn(homeHeading, 'mt-4 text-stone-50')}
                        >
                            Real patients.{' '}
                            <em className='text-gold-300 italic'>
                                Real afters.
                            </em>
                        </h2>
                        <p className='mt-5 text-lg leading-relaxed text-stone-300'>
                            Before-and-after photos from Alluring’s gallery.
                            Swipe through, then open the full gallery by
                            procedure. Individual results vary.
                        </p>
                    </div>
                    <Link
                        href='/gallery'
                        className='border-gold-400/60 hover:bg-gold-400 hidden min-h-12 items-center rounded-full border px-6 font-bold text-stone-50 transition-colors hover:text-stone-950 md:inline-flex'
                    >
                        See the full gallery →
                    </Link>
                </div>

                <ul
                    className='hp-rail mt-10 md:mt-14'
                    aria-label='Before-and-after photos'
                >
                    {photos.map((image, index) => {
                        const gallerySlug = GALLERY_SLUGS[image.procedureSlug]
                        return (
                            <li
                                key={image.id}
                                className='w-[72vw] max-w-[20rem] md:w-[19rem]'
                            >
                                <Link
                                    href={
                                        gallerySlug
                                            ? `/gallery/${gallerySlug}`
                                            : '/gallery'
                                    }
                                    className='group block focus-visible:outline-none'
                                >
                                    <span className='hp-rail-frame group-hover:ring-gold-400/60 group-focus-visible:ring-gold-400 relative block aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-stone-950 ring-1 ring-white/10 transition group-focus-visible:ring-2'>
                                        <Image
                                            src={image.url}
                                            alt={image.alt}
                                            fill
                                            sizes='(width >= 48rem) 19rem, 72vw'
                                            loading={
                                                index < 2 ? 'eager' : 'lazy'
                                            }
                                            className='object-contain transition-transform duration-700 group-hover:scale-[1.03]'
                                            placeholder={
                                                image.blurDataUrl
                                                    ? 'blur'
                                                    : 'empty'
                                            }
                                            blurDataURL={
                                                image.blurDataUrl ?? undefined
                                            }
                                        />
                                    </span>
                                    <span className='mt-3 flex items-center justify-between text-sm'>
                                        <span className='font-bold text-stone-100'>
                                            {image.procedureName}
                                        </span>
                                        <span className='text-gold-300 transition-transform group-hover:translate-x-1'>
                                            →
                                        </span>
                                    </span>
                                </Link>
                            </li>
                        )
                    })}
                </ul>

                <Link
                    href='/gallery'
                    className='border-gold-400/60 mt-8 inline-flex min-h-12 items-center rounded-full border px-6 font-bold text-stone-50 md:hidden'
                >
                    See the full gallery →
                </Link>
            </div>
        </section>
    )
}

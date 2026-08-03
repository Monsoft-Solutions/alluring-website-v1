/**
 * Atelier Results
 *
 * Real before/after media from the gallery, in a warm grid rather than the
 * shared GalleryShowcase — that component is styled to the stone/gold
 * system and would break the palette on sight.
 *
 * ---------------------------------------------------------------------
 * CROPPING: these are before/after PAIRS, two photographs composited into
 * one image. Cropping one cuts away part of the "before" or the "after",
 * which destroys the only thing the picture is for.
 *
 * The gallery holds mixed ratios (both 1:1 and 4:5 are present), so any
 * single fixed frame plus object-cover will crop something. Hence
 * object-contain on a tinted ground: the 4:5 majority fills the frame
 * exactly, the square minority letterboxes slightly, and nothing is ever
 * cut. Do not "fix" the letterboxing by switching to object-cover.
 *
 * The arch is also deliberately absent here. It is this direction's
 * signature form, but it belongs on lifestyle and portrait imagery (hero,
 * surgeons) — masking a clinical before/after into an arch lops off the
 * top of both photographs.
 * ---------------------------------------------------------------------
 *
 * Renders nothing when the gallery is empty, so an unseeded environment
 * shows a shorter page rather than a broken section.
 *
 * Server component; fetches its own media.
 */
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { getFeaturedGalleryMedia } from '@/lib/queries/gallery/gallery-list.query'

export async function AtelierResults() {
    const { media } = await getFeaturedGalleryMedia(6)

    if (media.length === 0) {
        return null
    }

    return (
        <section
            className='scroll-mt-24 bg-[#F6EDE4] px-6 py-20 md:px-10 md:py-28'
            aria-labelledby='atelier-results-heading'
            id='results'
        >
            <div className='mx-auto max-w-7xl'>
                <div className='mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between'>
                    <div className='max-w-2xl'>
                        <span className='text-xs tracking-[0.3em] text-[#C4674D] uppercase'>
                            Real patients
                        </span>
                        <h2
                            id='atelier-results-heading'
                            className='mt-5 font-[family-name:var(--font-fraunces)] text-4xl leading-[1.05] text-[#3D2B23] md:text-5xl'
                        >
                            Results, not
                            <span className='text-[#C4674D] italic'>
                                {' '}
                                renderings.
                            </span>
                        </h2>
                    </div>
                    <Link
                        href='/gallery'
                        className='group inline-flex shrink-0 items-center gap-2 text-sm font-medium text-[#C4674D] transition-colors hover:text-[#a8543d]'
                    >
                        See the full gallery
                        <ArrowRight
                            className='h-4 w-4 transition-transform group-hover:translate-x-1'
                            aria-hidden='true'
                        />
                    </Link>
                </div>

                {/* Uniform 4:5 frames — the dominant source ratio — with
                    object-contain so no pair is ever cut. */}
                <ul className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
                    {media.map((item) => (
                        <li key={item.id}>
                            <figure>
                                <div className='relative aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] bg-[#EFE3D6]'>
                                    <Image
                                        src={item.url}
                                        alt={item.alt || item.title}
                                        fill
                                        sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                                        className='object-contain'
                                        placeholder={
                                            item.blurDataUrl ? 'blur' : 'empty'
                                        }
                                        blurDataURL={
                                            item.blurDataUrl ?? undefined
                                        }
                                    />
                                </div>
                                <figcaption className='mt-3 text-sm leading-snug text-[#3D2B23]/55'>
                                    {item.title}
                                </figcaption>
                            </figure>
                        </li>
                    ))}
                </ul>

                <p className='mt-8 text-sm text-[#3D2B23]/50'>
                    Photographs are of actual patients and are published with
                    consent. Individual results vary.
                </p>
            </div>
        </section>
    )
}

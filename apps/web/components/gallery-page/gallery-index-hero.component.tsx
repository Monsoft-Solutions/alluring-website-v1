import Image from 'next/image'

import type {
    GalleryOverview,
    GalleryProcedure,
} from '@/lib/queries/gallery/gallery-overview.query'

import { GalleryProcedureChips } from './gallery-procedure-nav.component'

type GalleryIndexHeroProps = {
    overview: GalleryOverview
}

/** The three collections with the most results lead the arch collage. */
function collageCovers(procedures: GalleryProcedure[]) {
    return [...procedures]
        .filter((p) => p.cover)
        .sort(
            (a, b) =>
                b.photoCount + b.videoCount - (a.photoCount + a.videoCount)
        )
        .slice(0, 3)
}

/**
 * The gallery's opening: what this is, how much of it there is (real
 * counts from the database), and a chip per procedure so the visitor who
 * came for one result goes straight to it.
 */
export function GalleryIndexHero({ overview }: GalleryIndexHeroProps) {
    const { totals, procedures } = overview
    const covers = collageCovers(procedures)
    const [main, ...side] = covers

    return (
        <section
            aria-labelledby='gallery-title'
            className='overflow-hidden pt-32 pb-14 md:pt-40 md:pb-20'
        >
            <div className='mx-auto grid w-full max-w-[78rem] items-center gap-12 px-5 md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16'>
                <div className='min-w-0'>
                    <p className='gp-eyebrow'>Before &amp; after gallery</p>
                    <h1
                        id='gallery-title'
                        className='gp-display mt-5 text-[2.75rem] leading-[0.98] tracking-[-0.02em] text-balance md:text-[4rem] lg:text-[4.5rem]'
                    >
                        Real patients. Real <em>results.</em>
                    </h1>
                    <p className='mt-6 max-w-[36rem] text-[1.0625rem] leading-[1.65] text-pretty text-[var(--gp-ink-2)] md:text-[1.1875rem]'>
                        Before-and-after photos and videos of Alluring patients,
                        sorted by procedure. Every result here is a real
                        patient, and results vary from person to person.
                    </p>

                    <dl className='mt-8 flex flex-wrap gap-x-10 gap-y-4'>
                        {[
                            { value: totals.photos, label: 'photos' },
                            { value: totals.videos, label: 'videos' },
                            { value: procedures.length, label: 'procedures' },
                        ]
                            .filter((stat) => stat.value > 0)
                            .map((stat) => (
                                <div key={stat.label}>
                                    <dt className='sr-only'>{stat.label}</dt>
                                    <dd className='flex items-baseline gap-2'>
                                        <span className='gp-display text-[2.25rem] leading-none tabular-nums'>
                                            {stat.value}
                                        </span>
                                        <span className='text-sm tracking-wide text-[var(--gp-mute)] uppercase'>
                                            {stat.label}
                                        </span>
                                    </dd>
                                </div>
                            ))}
                    </dl>

                    <GalleryProcedureChips
                        procedures={procedures}
                        className='mt-10'
                    />
                </div>

                {main?.cover && (
                    <div
                        className='relative mx-auto hidden w-full max-w-[30rem] grid-cols-[1.35fr_1fr] gap-4 md:grid'
                        aria-hidden='true'
                    >
                        <div className='gp-arch relative row-span-2 aspect-[3/4.4] bg-[var(--gp-linen)] ring-1 ring-[var(--gp-line)]'>
                            <Image
                                src={main.cover.url}
                                alt=''
                                fill
                                priority
                                sizes='(width >= 64rem) 17rem, 55vw'
                                className='object-cover'
                            />
                        </div>
                        {side.map(
                            (p) =>
                                p.cover && (
                                    <div
                                        key={p.slug}
                                        className='gp-arch relative aspect-[3/4] bg-[var(--gp-linen)] ring-1 ring-[var(--gp-line)]'
                                    >
                                        <Image
                                            src={p.cover.url}
                                            alt=''
                                            fill
                                            sizes='(width >= 64rem) 12rem, 40vw'
                                            className='object-cover'
                                        />
                                    </div>
                                )
                        )}
                    </div>
                )}
            </div>
        </section>
    )
}

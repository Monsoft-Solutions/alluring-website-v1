import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'

import type { GalleryProcedure } from '@/lib/queries/gallery/gallery-overview.query'

function countLabel(procedure: GalleryProcedure) {
    const parts = [
        procedure.photoCount > 0 &&
            `${procedure.photoCount} ${procedure.photoCount === 1 ? 'photo' : 'photos'}`,
        procedure.videoCount > 0 &&
            `${procedure.videoCount} ${procedure.videoCount === 1 ? 'video' : 'videos'}`,
    ].filter(Boolean)
    return parts.join(' · ')
}

type GalleryProcedureChipsProps = {
    procedures: GalleryProcedure[]
    /** The collection being viewed, marked as the current page. */
    currentSlug?: string
    /** Show an "All results" chip first, linking back to /gallery. */
    showAll?: boolean
    className?: string
}

/**
 * One row of procedure chips. On the index it jumps straight to a
 * collection; on a collection it is the way across to the next one.
 */
export function GalleryProcedureChips({
    procedures,
    currentSlug,
    showAll = false,
    className,
}: GalleryProcedureChipsProps) {
    return (
        <nav aria-label='Gallery by procedure' className={className}>
            <ul className='gp-chips'>
                {showAll && (
                    <li>
                        <Link href='/gallery' className='gp-chip'>
                            All results
                        </Link>
                    </li>
                )}
                {procedures.map((procedure) => (
                    <li key={procedure.slug}>
                        <Link
                            href={`/gallery/${procedure.slug}`}
                            className='gp-chip'
                            aria-current={
                                procedure.slug === currentSlug
                                    ? 'page'
                                    : undefined
                            }
                        >
                            {procedure.name}
                            <span className='gp-chip__count'>
                                {procedure.photoCount + procedure.videoCount}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    )
}

type GalleryProcedureCardsProps = {
    procedures: GalleryProcedure[]
    className?: string
}

/**
 * A card per collection: its cover in the brand's arch window, the name,
 * and how many photos and videos it holds.
 */
export function GalleryProcedureCards({
    procedures,
    className,
}: GalleryProcedureCardsProps) {
    return (
        <ul
            className={cn(
                'grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4',
                className
            )}
        >
            {procedures.map((procedure) => (
                <li key={procedure.slug}>
                    <Link
                        href={`/gallery/${procedure.slug}`}
                        className='group block focus-visible:outline-none'
                    >
                        <span className='gp-arch relative block aspect-[3/4] bg-[var(--gp-linen)] ring-1 ring-[var(--gp-line)] transition group-hover:ring-2 group-hover:ring-[var(--gp-champagne-2)] group-focus-visible:ring-2 group-focus-visible:ring-[var(--gp-ink)]'>
                            {procedure.cover && (
                                <Image
                                    src={procedure.cover.url}
                                    alt={procedure.cover.alt}
                                    fill
                                    sizes='(width >= 64rem) 18rem, (width >= 48rem) 30vw, 45vw'
                                    className='object-cover transition-transform duration-700 group-hover:scale-[1.04]'
                                />
                            )}
                        </span>
                        <span className='mt-4 flex items-start justify-between gap-3'>
                            <span>
                                <span className='gp-display block text-[1.35rem] leading-tight md:text-[1.5rem]'>
                                    {procedure.name}
                                </span>
                                <span className='mt-1 block text-sm text-[var(--gp-mute)]'>
                                    {countLabel(procedure)}
                                </span>
                            </span>
                            <ArrowRight
                                aria-hidden='true'
                                className='mt-1.5 h-4 w-4 flex-none text-[var(--gp-bronze)] transition-transform group-hover:translate-x-1'
                            />
                        </span>
                    </Link>
                </li>
            ))}
        </ul>
    )
}

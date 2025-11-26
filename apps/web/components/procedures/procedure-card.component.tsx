'use client'

import { Procedure } from '@/lib/types/procedure.type'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface ProcedureCardProps {
    procedure: Procedure
    index: number
}

/**
 * Maps category values to display text for badges
 */
const getCategoryDisplayName = (
    category?: 'face' | 'breast' | 'body' | 'combined'
): string => {
    const categoryMap: Record<NonNullable<Procedure['category']>, string> = {
        breast: 'Breast',
        body: 'Body',
        face: 'Face',
        combined: 'Combined',
    }

    return category ? categoryMap[category] : 'Procedure'
}

/**
 * Cinematic full-bleed procedure card for mobile view.
 * Features:
 * - Full-width edge-to-edge imagery as background
 * - Gradient overlay for text contrast
 * - Content overlaid at bottom
 * - Prominent inline CTA
 * - Minimal, clean animations
 */
export function ProcedureCard({ procedure }: ProcedureCardProps) {
    const categoryDisplay = getCategoryDisplayName(procedure.category)
    const imageSrc = procedure.image || '/images/placeholder.jpg'
    const description =
        procedure.shortDescription || procedure.description || ''

    return (
        <Link
            href={`/procedures/${procedure.slug}`}
            className='group relative block aspect-3/4 w-full overflow-hidden'
            aria-label={`View ${procedure.title}`}
        >
            {/* Background Image */}
            <div className='absolute inset-0'>
                <Image
                    src={imageSrc}
                    alt={procedure.title}
                    fill
                    className='object-cover transition-transform duration-700 ease-out group-active:scale-105'
                    sizes='100vw'
                    priority={false}
                />
            </div>

            {/* Gradient Overlay */}
            <div className='absolute inset-0 bg-linear-to-t from-stone-950 via-stone-900/50 to-transparent' />

            {/* Category Badge - Top Left */}
            {procedure.category && (
                <div className='absolute top-6 left-6'>
                    <span className='border-gold-500/50 inline-block border bg-stone-950/60 px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-white uppercase backdrop-blur-sm'>
                        {categoryDisplay}
                    </span>
                </div>
            )}

            {/* Content Overlay - Bottom */}
            <div className='absolute right-0 bottom-0 left-0 flex flex-col p-6'>
                {/* Title */}
                <h3 className='mb-3 font-serif text-3xl leading-tight text-white'>
                    {procedure.title}
                </h3>

                {/* Description */}
                <p className='mb-6 line-clamp-2 text-base leading-relaxed font-light text-stone-300'>
                    {description}
                </p>

                {/* CTA Button */}
                <div className='border-gold-500 bg-gold-500/10 group-active:bg-gold-500/20 flex items-center justify-center gap-3 border px-6 py-4 backdrop-blur-sm transition-colors duration-300'>
                    <span className='text-gold-400 text-sm font-bold tracking-[0.15em] uppercase'>
                        Learn More
                    </span>
                    <ArrowRight className='text-gold-400 h-4 w-4' />
                </div>
            </div>
        </Link>
    )
}

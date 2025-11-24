'use client'

import { Procedure } from '@/lib/types/procedure.type'
import { useRef } from 'react'
import { motion, useScroll, useTransform, useMotionValue } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface SignatureProcedureCardProps {
    procedure: Procedure
    index: number
    containerRef?: React.RefObject<HTMLDivElement>
}

/**
 * Maps category values to display text for stat badges
 */
const getCategoryDisplayName = (
    category?: 'face' | 'breast' | 'body' | 'combined'
): string => {
    const categoryMap: Record<NonNullable<Procedure['category']>, string> = {
        breast: 'Breast Procedures',
        body: 'Body Contouring',
        face: 'Facial Rejuvenation',
        combined: 'Combined Procedures',
    }

    return category ? categoryMap[category] : 'Procedure'
}

export function SignatureProcedureCard({
    procedure,
    index,
    containerRef,
}: SignatureProcedureCardProps) {
    const cardRef = useRef<HTMLDivElement>(null)

    // Track the card's horizontal position within the scroll container
    // Only if containerRef is provided (for parallax effect)
    const { scrollXProgress } = useScroll({
        container: containerRef || undefined,
        target: cardRef,
        axis: 'x',
        offset: ['start end', 'end start'],
    })

    // Parallax effect: move image horizontally as card scrolls
    // Range is -10% to 10% to create a subtle depth effect
    // Only apply parallax if containerRef is provided
    const staticX = useMotionValue('0%')
    const parallaxX = useTransform(scrollXProgress, [0, 1], ['-10%', '10%'])
    const x = containerRef ? parallaxX : staticX

    const categoryDisplay = getCategoryDisplayName(procedure.category)
    const imageSrc = procedure.image || '/images/placeholder.jpg'
    const description =
        procedure.shortDescription || procedure.description || ''

    return (
        <motion.div
            ref={cardRef}
            className='group relative h-[600px] min-w-[85vw] cursor-pointer snap-center overflow-hidden md:min-w-[450px]'
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            viewport={{
                root: containerRef || undefined,
                once: true,
                margin: '0px -10% 0px 0px',
            }}
        >
            <Link
                href={`/procedures/${procedure.slug}`}
                className='absolute inset-0 z-10'
                aria-label={`View ${procedure.title}`}
            >
                <span className='sr-only'>{procedure.title}</span>
            </Link>

            {/* Image Wrapper with Parallax & Zoom Effect */}
            <div className='absolute inset-0 h-full w-full overflow-hidden bg-stone-800'>
                <motion.div
                    style={{ x, scale: 1.25 }}
                    whileHover={{ scale: 1.35 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className='relative h-full w-full'
                >
                    <Image
                        src={imageSrc}
                        alt={procedure.title}
                        fill
                        className='object-cover opacity-60 transition-opacity duration-500 group-hover:opacity-40'
                        sizes='(max-width: 768px) 85vw, 450px'
                    />
                </motion.div>
            </div>

            {/* Gradient */}
            <div className='absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/20 to-transparent opacity-90' />

            {/* Content */}
            <div className='absolute right-0 bottom-0 left-0 translate-y-4 transform p-8 transition-transform duration-500 group-hover:translate-y-0 md:p-12'>
                <span className='border-gold-500/30 text-gold-400 mb-4 inline-block border px-3 py-1 text-xs tracking-widest uppercase backdrop-blur-sm'>
                    {categoryDisplay}
                </span>
                <h3 className='mb-3 font-serif text-4xl text-white'>
                    {procedure.title}
                </h3>
                <p className='mb-8 max-w-xs translate-y-4 transform text-lg text-stone-300 opacity-0 transition-opacity delay-100 duration-500 group-hover:translate-y-0 group-hover:opacity-100'>
                    {description}
                </p>

                <div className='group-hover:bg-gold-500 group-hover:border-gold-500 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 transition-all duration-300 group-hover:text-stone-900'>
                    <ArrowRight className='h-5 w-5' />
                </div>
            </div>
        </motion.div>
    )
}

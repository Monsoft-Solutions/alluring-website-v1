'use client'

/**
 * FinancingHero Component
 *
 * Full-viewport hero section for the financing page with parallax background,
 * trust indicators, and prominent CTAs. Uses the luxury aesthetic with
 * gold accents and serif typography.
 */
import { motion, useScroll, useTransform } from 'framer-motion'
import {
    ArrowRight,
    type LucideIcon,
    Percent,
    Phone,
    Shield,
    Zap,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'

import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'

import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import type { FinancingHeroProps } from '@/lib/types/financing.type'

/**
 * Map icon names to Lucide components
 */
const iconMap: Record<string, LucideIcon> = {
    Percent,
    Zap,
    Shield,
}

export function FinancingHero({
    badge,
    headline,
    subheadline,
    description,
    trustIndicators,
    primaryCta,
    secondaryCta,
    backgroundImage,
    id = 'financing-hero',
    className,
}: FinancingHeroProps) {
    const containerRef = useRef<HTMLDivElement>(null)

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end start'],
    })

    const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
    const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.3])

    return (
        <section
            ref={containerRef}
            id={id}
            className={cn(
                'relative flex min-h-[90vh] items-center overflow-hidden bg-stone-900 lg:min-h-screen',
                className
            )}
        >
            {/* Parallax Background */}
            {backgroundImage && (
                <motion.div
                    style={{ y, opacity }}
                    className='absolute inset-0 -top-[15%] z-0 h-[130%]'
                >
                    <Image
                        src={backgroundImage}
                        alt='Luxury plastic surgery clinic interior'
                        fill
                        priority
                        className='object-cover'
                        sizes='100vw'
                    />
                    {/* Sophisticated gradient overlays */}
                    <div className='absolute inset-0 bg-linear-to-r from-stone-900/95 via-stone-900/75 to-stone-900/50' />
                    <div className='absolute inset-0 bg-linear-to-t from-stone-900/90 via-transparent to-stone-900/30' />
                </motion.div>
            )}

            {/* Fallback gradient background */}
            {!backgroundImage && (
                <div className='absolute inset-0 bg-linear-to-br from-stone-900 via-stone-800 to-stone-900' />
            )}

            {/* Decorative elements */}
            <div className='bg-gold-500/10 pointer-events-none absolute top-1/4 left-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full blur-[150px]' />
            <div className='bg-gold-400/5 pointer-events-none absolute right-0 bottom-1/4 h-[400px] w-[400px] translate-x-1/3 rounded-full blur-[120px]' />

            {/* Content */}
            <ContentWrapper
                size='lg'
                paddingX='px-6 md:px-12'
                className='relative z-10 py-20 md:py-28'
            >
                <div className='max-w-3xl'>
                    {/* Badge */}
                    {badge && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className='mb-6'
                        >
                            <span className='border-gold-500/40 bg-gold-500/10 text-gold-400 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium tracking-wide'>
                                {badge}
                            </span>
                        </motion.div>
                    )}

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className='mb-4 font-serif text-4xl leading-[1.1] text-white md:text-5xl lg:text-6xl xl:text-7xl'
                    >
                        {headline}
                    </motion.h1>

                    {/* Subheadline */}
                    {subheadline && (
                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.3 }}
                            className='text-gold-400 mb-6 font-serif text-xl font-light italic md:text-2xl'
                        >
                            {subheadline}
                        </motion.p>
                    )}

                    {/* Gold accent line */}
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className='bg-gold-500 mb-8 h-1 w-24 origin-left shadow-[0_0_20px_rgba(234,179,8,0.4)]'
                    />

                    {/* Description */}
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.5 }}
                        className='mb-10 max-w-xl text-lg leading-relaxed font-light text-stone-300 md:text-xl'
                    >
                        {description}
                    </motion.p>

                    {/* Trust Indicators */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className='mb-10 flex flex-wrap gap-6 md:gap-8'
                    >
                        {trustIndicators.map((indicator, idx) => {
                            const IconComponent = iconMap[indicator.icon]
                            return (
                                <div
                                    key={idx}
                                    className='flex items-center gap-3'
                                >
                                    <div className='bg-gold-500/20 text-gold-400 flex h-12 w-12 items-center justify-center rounded-full'>
                                        {IconComponent && (
                                            <IconComponent className='h-5 w-5' />
                                        )}
                                    </div>
                                    <div>
                                        <div className='text-lg font-bold text-white'>
                                            {indicator.text}
                                        </div>
                                        <div className='text-sm text-stone-400'>
                                            {indicator.label}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </motion.div>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.7 }}
                        className='flex flex-col gap-4 sm:flex-row'
                    >
                        <Button
                            asChild
                            size='lg'
                            className='bg-gold-500 hover:bg-gold-600 group min-w-[200px] border-none px-8 py-6 text-base font-bold tracking-wide text-white uppercase shadow-lg shadow-amber-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/30'
                        >
                            <a href={primaryCta.href}>
                                <Phone className='mr-2 h-4 w-4' />
                                {primaryCta.text}
                            </a>
                        </Button>

                        {secondaryCta && (
                            <Button
                                asChild
                                size='lg'
                                variant='outline'
                                className='hover:border-gold-500/50 group min-w-[160px] border-white/20 bg-white/5 px-8 py-6 text-base font-bold tracking-wide text-white uppercase backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:text-white'
                            >
                                <Link href={secondaryCta.href}>
                                    {secondaryCta.text}
                                    <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
                                </Link>
                            </Button>
                        )}
                    </motion.div>
                </div>
            </ContentWrapper>

            {/* Scroll indicator */}
            <motion.div
                className='absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-white/60'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, 8, 0] }}
                transition={{
                    opacity: { delay: 1, duration: 0.5 },
                    y: { duration: 2, repeat: Infinity },
                }}
            >
                <span className='text-xs tracking-widest uppercase'>
                    Explore Options
                </span>
                <div className='h-10 w-px bg-white/30' />
            </motion.div>
        </section>
    )
}

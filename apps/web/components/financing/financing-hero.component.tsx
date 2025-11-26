'use client'

/**
 * FinancingHero Component
 *
 * Split-layout hero section for the financing page with content on the left
 * and a prominent image on the right. Uses the luxury aesthetic with
 * gold accents and serif typography.
 *
 * Layout: 50/50 split on desktop, stacked on mobile (content first)
 */
import { motion } from 'framer-motion'
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

import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'

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
    return (
        <section
            id={id}
            className={cn(
                'relative min-h-[90vh] overflow-hidden bg-stone-900 lg:min-h-screen',
                className
            )}
        >
            {/* Main Grid Container */}
            <div className='grid min-h-[90vh] grid-cols-1 lg:min-h-screen lg:grid-cols-2'>
                {/* Left Side - Content */}
                <div className='relative z-10 flex flex-col items-center justify-center px-6 py-16 pt-24 md:px-12 lg:py-20 xl:px-20'>
                    {/* Decorative background blur */}
                    <div className='bg-gold-500/10 pointer-events-none absolute top-1/4 left-0 h-[400px] w-[400px] -translate-x-1/2 rounded-full blur-[120px]' />

                    <div className='relative z-10 max-w-xl'>
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
                            className='mb-4 font-serif text-4xl leading-[1.1] text-white md:text-5xl lg:text-5xl xl:text-6xl'
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
                            className='mb-8 text-base leading-relaxed font-light text-stone-300 md:text-lg'
                        >
                            {description}
                        </motion.p>

                        {/* Trust Indicators */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                            className='mb-8 flex flex-wrap gap-4 md:gap-6'
                        >
                            {trustIndicators.map((indicator, idx) => {
                                const IconComponent = iconMap[indicator.icon]
                                return (
                                    <div
                                        key={idx}
                                        className='flex items-center gap-2.5'
                                    >
                                        <div className='bg-gold-500/20 text-gold-400 flex h-10 w-10 items-center justify-center rounded-full'>
                                            {IconComponent && (
                                                <IconComponent className='h-4 w-4' />
                                            )}
                                        </div>
                                        <div>
                                            <div className='text-base font-bold text-white'>
                                                {indicator.text}
                                            </div>
                                            <div className='text-xs text-stone-400'>
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
                                className='bg-gold-500 hover:bg-gold-600 group min-w-[180px] border-none px-6 py-5 text-sm font-bold tracking-wide text-white uppercase shadow-lg shadow-amber-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/30'
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
                                    className='hover:border-gold-500/50 group min-w-[140px] border-white/20 bg-white/5 px-6 py-5 text-sm font-bold tracking-wide text-white uppercase backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:text-white'
                                >
                                    <Link href={secondaryCta.href}>
                                        {secondaryCta.text}
                                        <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
                                    </Link>
                                </Button>
                            )}
                        </motion.div>
                    </div>
                </div>

                {/* Right Side - Image */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className='relative hidden lg:block'
                >
                    {backgroundImage && (
                        <>
                            <Image
                                src={backgroundImage}
                                alt='Luxury plastic surgery consultation'
                                fill
                                priority
                                className='object-cover'
                                sizes='50vw'
                            />
                            {/* Gradient overlay on left edge for seamless blend */}
                            <div className='absolute inset-0 bg-linear-to-r from-stone-900 via-transparent to-transparent' />
                            {/* Subtle vignette for depth */}
                            <div className='absolute inset-0 bg-linear-to-b from-stone-900/20 via-transparent to-stone-900/40' />
                        </>
                    )}

                    {/* Fallback gradient if no image */}
                    {!backgroundImage && (
                        <div className='absolute inset-0 bg-linear-to-br from-stone-800 via-stone-700 to-stone-800' />
                    )}

                    {/* Decorative corner accent */}
                    <div className='absolute right-8 bottom-8 z-10'>
                        <div className='border-gold-500/30 h-24 w-24 border-r-2 border-b-2' />
                    </div>
                </motion.div>

                {/* Mobile Image - Shows below content on mobile */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className='relative h-[50vh] lg:hidden'
                >
                    {backgroundImage && (
                        <>
                            <Image
                                src={backgroundImage}
                                alt='Luxury plastic surgery consultation'
                                fill
                                priority
                                className='object-cover'
                                sizes='100vw'
                            />
                            {/* Gradient overlay for mobile */}
                            <div className='absolute inset-0 bg-linear-to-t from-stone-900 via-stone-900/40 to-transparent' />
                        </>
                    )}
                </motion.div>
            </div>
        </section>
    )
}

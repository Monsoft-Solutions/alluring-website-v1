'use client'

/**
 * FinancingPartners Component
 *
 * Showcases financing partners (Cherry, CareCredit, United Credit) with
 * interactive cards featuring official logos, hover animations, benefits reveal,
 * and highlight statistics.
 */
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle } from 'lucide-react'
import Image from 'next/image'

import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'

import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'
import { SectionHeader } from '@/components/shared/section-header.component'
import type { FinancingPartnersProps } from '@/lib/types/financing.type'

/**
 * Accent color mappings for partner cards
 */
const accentColors: Record<
    string,
    {
        bg: string
        border: string
        text: string
        gradient: string
        logoBg: string
        highlightBg: string
    }
> = {
    rose: {
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/20 hover:border-rose-500/40',
        text: 'text-rose-500',
        gradient: 'from-rose-500/5 via-rose-500/10 to-transparent',
        logoBg: 'bg-gradient-to-br from-rose-50 to-rose-100/80',
        highlightBg: 'bg-rose-50/80',
    },
    blue: {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20 hover:border-blue-500/40',
        text: 'text-blue-500',
        gradient: 'from-blue-500/5 via-blue-500/10 to-transparent',
        logoBg: 'bg-gradient-to-br from-blue-50 to-blue-100/80',
        highlightBg: 'bg-blue-50/80',
    },
    emerald: {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20 hover:border-emerald-500/40',
        text: 'text-emerald-600',
        gradient: 'from-emerald-500/5 via-emerald-500/10 to-transparent',
        logoBg: 'bg-gradient-to-br from-emerald-800 to-emerald-900',
        highlightBg: 'bg-emerald-50/80',
    },
}

/**
 * Dark mode accent color mappings
 */
const darkAccentColors: Record<
    string,
    {
        logoBg: string
        highlightBg: string
    }
> = {
    rose: {
        logoBg: 'dark:bg-gradient-to-br dark:from-rose-950/50 dark:to-rose-900/30',
        highlightBg: 'dark:bg-rose-950/40',
    },
    blue: {
        logoBg: 'dark:bg-gradient-to-br dark:from-blue-950/50 dark:to-blue-900/30',
        highlightBg: 'dark:bg-blue-950/40',
    },
    emerald: {
        logoBg: 'dark:bg-gradient-to-br dark:from-emerald-900 dark:to-emerald-950',
        highlightBg: 'dark:bg-emerald-950/40',
    },
}

export function FinancingPartners({
    badge,
    title,
    description,
    partners,
    variant = 'default',
    id = 'financing-partners',
    className,
}: FinancingPartnersProps) {
    return (
        <SectionContainer
            id={id}
            variant={variant}
            className={cn('py-20 md:py-28', className)}
        >
            <ContentWrapper size='lg'>
                {/* Section Header */}
                <SectionHeader
                    badge={badge}
                    title={title}
                    description={description}
                    align='center'
                    spacing='loose'
                    className='mb-16'
                />

                {/* Partners Grid */}
                <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
                    {partners.map((partner, idx) => {
                        const colors =
                            accentColors[partner.accentColor || 'blue']!
                        const darkColors =
                            darkAccentColors[partner.accentColor || 'blue']!

                        return (
                            <motion.div
                                key={partner.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-50px' }}
                                transition={{
                                    duration: 0.6,
                                    delay: idx * 0.15,
                                    ease: [0.21, 0.47, 0.32, 0.98],
                                }}
                                className='group relative'
                            >
                                <div
                                    className={cn(
                                        'relative h-full overflow-hidden rounded-2xl border-2 bg-white p-8 transition-all duration-500',
                                        'shadow-sm hover:shadow-xl hover:shadow-stone-200/50',
                                        'dark:bg-stone-900/50 dark:backdrop-blur-sm dark:hover:shadow-stone-900/50',
                                        colors.border
                                    )}
                                >
                                    {/* Background gradient on hover */}
                                    <div
                                        className={cn(
                                            'absolute inset-0 bg-gradient-to-b opacity-0 transition-opacity duration-500 group-hover:opacity-100',
                                            colors.gradient
                                        )}
                                    />

                                    {/* Content */}
                                    <div className='relative z-10'>
                                        {/* Logo Section */}
                                        <div className='mb-6'>
                                            {partner.logoUrl ? (
                                                <div
                                                    className={cn(
                                                        'flex h-20 items-center justify-center rounded-xl p-4 transition-transform duration-300 group-hover:scale-[1.02]',
                                                        colors.logoBg,
                                                        darkColors.logoBg
                                                    )}
                                                >
                                                    <Image
                                                        src={partner.logoUrl}
                                                        alt={`${partner.name} logo`}
                                                        width={180}
                                                        height={60}
                                                        className='h-auto max-h-12 w-auto object-contain'
                                                    />
                                                </div>
                                            ) : (
                                                <div
                                                    className={cn(
                                                        'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold tracking-wider uppercase',
                                                        colors.bg,
                                                        colors.text
                                                    )}
                                                >
                                                    {partner.name}
                                                </div>
                                            )}
                                        </div>

                                        {/* Tagline */}
                                        <h3 className='mb-3 text-xl font-bold text-stone-900 dark:text-white'>
                                            {partner.tagline}
                                        </h3>

                                        {/* Description */}
                                        <p className='text-muted-foreground mb-6 text-sm leading-relaxed'>
                                            {partner.description}
                                        </p>

                                        {/* Highlights */}
                                        <div className='mb-6 grid grid-cols-3 gap-2'>
                                            {partner.highlights.map(
                                                (highlight, hIdx) => (
                                                    <div
                                                        key={hIdx}
                                                        className={cn(
                                                            'rounded-lg p-3 text-center transition-colors duration-300',
                                                            colors.highlightBg,
                                                            darkColors.highlightBg
                                                        )}
                                                    >
                                                        <div
                                                            className={cn(
                                                                'text-lg font-bold',
                                                                colors.text
                                                            )}
                                                        >
                                                            {highlight.value}
                                                        </div>
                                                        <div className='text-muted-foreground text-xs'>
                                                            {highlight.label}
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>

                                        {/* Benefits */}
                                        <ul className='mb-6 space-y-2.5'>
                                            {partner.benefits.map(
                                                (benefit, bIdx) => (
                                                    <li
                                                        key={bIdx}
                                                        className='flex items-start gap-2.5 text-sm text-stone-600 dark:text-stone-300'
                                                    >
                                                        <CheckCircle
                                                            className={cn(
                                                                'mt-0.5 h-4 w-4 shrink-0',
                                                                colors.text
                                                            )}
                                                        />
                                                        <span>{benefit}</span>
                                                    </li>
                                                )
                                            )}
                                        </ul>

                                        {/* Apply Button */}
                                        {partner.applyUrl && (
                                            <Button
                                                asChild
                                                variant='outline'
                                                className={cn(
                                                    'group/btn w-full transition-all duration-300',
                                                    'hover:border-current',
                                                    colors.text
                                                )}
                                            >
                                                <a
                                                    href={partner.applyUrl}
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                >
                                                    Apply with {partner.name}
                                                    <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1' />
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>

                {/* Disclaimer */}
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                    className='text-muted-foreground mt-12 text-center text-xs'
                >
                    *Subject to credit approval. Terms and conditions apply.
                    Visit each partner&apos;s website for complete details.
                </motion.p>
            </ContentWrapper>
        </SectionContainer>
    )
}

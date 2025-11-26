'use client'

/**
 * FinancingPartners Component
 *
 * Showcases financing partners (Cherry, CareCredit, United Credit) with
 * interactive cards featuring hover animations, benefits reveal, and
 * highlight statistics.
 */
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle } from 'lucide-react'

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
    { bg: string; border: string; text: string; gradient: string }
> = {
    rose: {
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        text: 'text-rose-400',
        gradient: 'from-rose-500/20 via-transparent to-transparent',
    },
    blue: {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
        gradient: 'from-blue-500/20 via-transparent to-transparent',
    },
    emerald: {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        gradient: 'from-emerald-500/20 via-transparent to-transparent',
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

                        return (
                            <motion.div
                                key={partner.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className='group relative'
                            >
                                <div
                                    className={cn(
                                        'relative h-full overflow-hidden rounded-2xl border bg-white/5 p-8 backdrop-blur-sm transition-all duration-500',
                                        'hover:border-white/20 hover:bg-white/10',
                                        colors.border
                                    )}
                                >
                                    {/* Background gradient on hover */}
                                    <div
                                        className={cn(
                                            'absolute inset-0 bg-linear-to-b opacity-0 transition-opacity duration-500 group-hover:opacity-100',
                                            colors.gradient
                                        )}
                                    />

                                    {/* Content */}
                                    <div className='relative z-10'>
                                        {/* Header */}
                                        <div className='mb-6'>
                                            <div
                                                className={cn(
                                                    'mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wider uppercase',
                                                    colors.bg,
                                                    colors.text
                                                )}
                                            >
                                                {partner.name}
                                            </div>
                                            <h3 className='text-xl font-bold text-stone-900 dark:text-white'>
                                                {partner.tagline}
                                            </h3>
                                        </div>

                                        {/* Description */}
                                        <p className='text-muted-foreground mb-6 text-sm leading-relaxed'>
                                            {partner.description}
                                        </p>

                                        {/* Highlights */}
                                        <div className='mb-6 grid grid-cols-3 gap-3'>
                                            {partner.highlights.map(
                                                (highlight, hIdx) => (
                                                    <div
                                                        key={hIdx}
                                                        className='rounded-lg bg-stone-100/50 p-3 text-center dark:bg-white/5'
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
                                        <ul className='mb-6 space-y-2'>
                                            {partner.benefits.map(
                                                (benefit, bIdx) => (
                                                    <li
                                                        key={bIdx}
                                                        className='flex items-start gap-2 text-sm text-stone-600 dark:text-stone-300'
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
                                                className='group/btn w-full'
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
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className='text-muted-foreground mt-12 text-center text-xs'
                >
                    *Subject to credit approval. Terms and conditions apply.
                    Visit each partner&apos;s website for complete details.
                </motion.p>
            </ContentWrapper>
        </SectionContainer>
    )
}

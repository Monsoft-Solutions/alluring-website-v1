'use client'

/**
 * FinancingProcedures Component
 *
 * Displays available procedures organized by category (Face, Body, Breast)
 * with links to individual procedure pages. Beautiful card design with
 * elegant hover effects and category icons.
 */
import { motion } from 'framer-motion'
import {
    ArrowRight,
    Heart,
    type LucideIcon,
    Smile,
    Sparkles,
} from 'lucide-react'
import Link from 'next/link'

import { cn } from '@workspace/ui/lib/utils'

import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'
import { SectionHeader } from '@/components/shared/section-header.component'
import type { FinancingProceduresProps } from '@/lib/types/financing.type'

/**
 * Map icon names to Lucide components
 */
const iconMap: Record<string, LucideIcon> = {
    Smile,
    Heart,
    Sparkles,
}

/**
 * Category accent colors following Stone + Gold design system
 * Uses subtle stone variations with strategic gold accents
 */
const categoryColors: Record<
    string,
    { bg: string; icon: string; text: string }
> = {
    Smile: {
        bg: 'bg-stone-100/50 dark:bg-stone-800/40',
        icon: 'text-gold-500 dark:text-gold-400',
        text: 'text-gold-600 dark:text-gold-400',
    },
    Heart: {
        bg: 'bg-stone-100/60 dark:bg-stone-800/50',
        icon: 'text-gold-500 dark:text-gold-400',
        text: 'text-gold-600 dark:text-gold-400',
    },
    Sparkles: {
        bg: 'bg-gold-500/10 dark:bg-gold-500/15',
        icon: 'text-gold-500 dark:text-gold-400',
        text: 'text-gold-600 dark:text-gold-400',
    },
}

/**
 * Default colors fallback - using gold accent background
 */
const defaultColors: { bg: string; icon: string; text: string } = {
    bg: 'bg-gold-500/10 dark:bg-gold-500/15',
    icon: 'text-gold-500 dark:text-gold-400',
    text: 'text-gold-600 dark:text-gold-400',
}

/**
 * Get category colors with fallback to Sparkles
 */
function getCategoryColors(icon: string): {
    bg: string
    icon: string
    text: string
} {
    return categoryColors[icon] ?? defaultColors
}

export function FinancingProcedures({
    badge,
    title,
    description,
    categories,
    variant = 'default',
    id = 'financing-procedures',
    className,
}: FinancingProceduresProps) {
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

                {/* Categories Grid */}
                <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
                    {categories.map((category, idx) => {
                        const IconComponent = iconMap[category.icon]
                        const colors = getCategoryColors(category.icon)

                        return (
                            <motion.div
                                key={category.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className='group'
                            >
                                <div
                                    className={cn(
                                        'relative flex h-full flex-col overflow-hidden rounded-3xl border bg-white/90 backdrop-blur-sm transition-all duration-500',
                                        'hover:border-gold-500/30 border-stone-200/80',
                                        'shadow-lg shadow-stone-200/40 hover:shadow-xl hover:shadow-stone-300/50',
                                        'hover:-translate-y-1',
                                        'dark:hover:border-gold-500/30 dark:border-stone-700/60 dark:bg-stone-900/80',
                                        'dark:shadow-stone-950/40 dark:hover:shadow-stone-950/60'
                                    )}
                                >
                                    {/* Category Header with Icon */}
                                    <div className={cn('p-8 pb-6', colors.bg)}>
                                        <div className='flex items-center gap-4'>
                                            <div
                                                className={cn(
                                                    'flex h-16 w-16 items-center justify-center rounded-2xl',
                                                    'bg-white/80 shadow-md ring-1 ring-stone-200/50',
                                                    'transition-transform duration-300 group-hover:scale-105',
                                                    'dark:bg-stone-800/80 dark:ring-stone-700/50'
                                                )}
                                            >
                                                {IconComponent && (
                                                    <IconComponent
                                                        className={cn(
                                                            'h-8 w-8',
                                                            colors.icon
                                                        )}
                                                        strokeWidth={1.5}
                                                    />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className='text-xl font-bold tracking-tight text-stone-900 dark:text-white'>
                                                    {category.name}
                                                </h3>
                                                <p className='mt-0.5 text-sm text-stone-500 dark:text-stone-400'>
                                                    {category.procedures.length}{' '}
                                                    procedures
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Procedures List - flex-1 to fill available space */}
                                    <div className='flex flex-1 flex-col p-8 pt-4'>
                                        <ul className='space-y-1'>
                                            {category.procedures.map(
                                                (procedure) => (
                                                    <li key={procedure.slug}>
                                                        <Link
                                                            href={`/procedures/${procedure.slug}`}
                                                            className={cn(
                                                                'group/link flex items-center justify-between rounded-xl px-4 py-3.5',
                                                                'transition-all duration-200',
                                                                'hover:bg-stone-100/80 dark:hover:bg-stone-800/60'
                                                            )}
                                                        >
                                                            <span className='font-medium text-stone-700 transition-colors group-hover/link:text-stone-900 dark:text-stone-300 dark:group-hover/link:text-white'>
                                                                {procedure.name}
                                                            </span>
                                                            <ArrowRight
                                                                className={cn(
                                                                    'h-4 w-4 opacity-0 transition-all duration-200',
                                                                    'group-hover/link:translate-x-1 group-hover/link:opacity-100',
                                                                    colors.icon
                                                                )}
                                                            />
                                                        </Link>
                                                    </li>
                                                )
                                            )}
                                        </ul>

                                        {/* Category CTA - Always at bottom */}
                                        <div className='mt-auto border-t border-stone-200/80 pt-6 dark:border-stone-700/60'>
                                            <Link
                                                href='/procedures'
                                                className={cn(
                                                    'group/cta inline-flex items-center text-sm font-semibold tracking-wide',
                                                    'transition-colors duration-200',
                                                    colors.text
                                                )}
                                            >
                                                View all{' '}
                                                {category.name.toLowerCase()}
                                                <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover/cta:translate-x-1' />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>

                {/* Bottom Message */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className={cn(
                        'mt-14 rounded-3xl p-10 text-center',
                        'bg-linear-to-br from-stone-900 via-stone-900 to-stone-800',
                        'shadow-xl ring-1 ring-stone-700/50'
                    )}
                >
                    <p className='text-gold-400 text-lg font-semibold'>
                        All procedures are eligible for financing
                    </p>
                    <p className='mx-auto mt-2 max-w-md text-sm text-stone-400'>
                        Contact us to discuss a customized payment plan for your
                        specific procedure
                    </p>
                </motion.div>
            </ContentWrapper>
        </SectionContainer>
    )
}

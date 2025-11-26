'use client'

/**
 * FinancingProcedures Component
 *
 * Displays available procedures organized by category (Face, Body, Breast)
 * with links to individual procedure pages. Demonstrates what can be financed.
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
                        return (
                            <motion.div
                                key={category.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className='group'
                            >
                                <div className='h-full rounded-2xl border border-stone-200 bg-white p-8 shadow-sm transition-all duration-300 hover:border-stone-300 hover:shadow-md dark:border-stone-800 dark:bg-stone-900/50'>
                                    {/* Category Header */}
                                    <div className='mb-6 flex items-center gap-4'>
                                        <div className='bg-gold-500/10 flex h-14 w-14 items-center justify-center rounded-xl'>
                                            {IconComponent && (
                                                <IconComponent className='text-gold-500 h-7 w-7' />
                                            )}
                                        </div>
                                        <h3 className='text-xl font-bold text-stone-900 dark:text-white'>
                                            {category.name}
                                        </h3>
                                    </div>

                                    {/* Procedures List */}
                                    <ul className='space-y-3'>
                                        {category.procedures.map(
                                            (procedure) => (
                                                <li key={procedure.slug}>
                                                    <Link
                                                        href={`/procedures/${procedure.slug}`}
                                                        className='group/link flex items-center justify-between rounded-lg px-4 py-3 transition-all duration-200 hover:bg-stone-100 dark:hover:bg-stone-800'
                                                    >
                                                        <span className='text-stone-700 dark:text-stone-300'>
                                                            {procedure.name}
                                                        </span>
                                                        <ArrowRight className='text-gold-500 h-4 w-4 opacity-0 transition-all duration-200 group-hover/link:translate-x-1 group-hover/link:opacity-100' />
                                                    </Link>
                                                </li>
                                            )
                                        )}
                                    </ul>

                                    {/* Category CTA */}
                                    <div className='mt-6 border-t border-stone-200 pt-6 dark:border-stone-700'>
                                        <Link
                                            href='/procedures'
                                            className='text-gold-600 hover:text-gold-500 dark:text-gold-400 group/cta inline-flex items-center text-sm font-medium'
                                        >
                                            View all{' '}
                                            {category.name.toLowerCase()}
                                            <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover/cta:translate-x-1' />
                                        </Link>
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
                    className='bg-gold-500/10 mt-12 rounded-2xl p-8 text-center'
                >
                    <p className='text-lg font-medium text-stone-900 dark:text-white'>
                        All procedures are eligible for financing
                    </p>
                    <p className='text-muted-foreground mt-2 text-sm'>
                        Contact us to discuss a customized payment plan for your
                        specific procedure
                    </p>
                </motion.div>
            </ContentWrapper>
        </SectionContainer>
    )
}

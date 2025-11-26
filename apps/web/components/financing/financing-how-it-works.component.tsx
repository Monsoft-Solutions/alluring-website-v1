'use client'

/**
 * FinancingHowItWorks Component
 *
 * Visual step-by-step timeline showing the financing process.
 * Features numbered steps with icons, descriptions, and duration estimates.
 */
import { motion } from 'framer-motion'
import {
    FileCheck,
    type LucideIcon,
    Sparkles,
    Timer,
    UserCheck,
} from 'lucide-react'
import Link from 'next/link'

import { cn } from '@workspace/ui/lib/utils'

import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'
import { SectionHeader } from '@/components/shared/section-header.component'
import type { FinancingHowItWorksProps } from '@/lib/types/financing.type'

/**
 * Map icon names to Lucide components
 */
const iconMap: Record<string, LucideIcon> = {
    UserCheck,
    FileCheck,
    Timer,
    Sparkles,
}

export function FinancingHowItWorks({
    badge,
    title,
    description,
    steps,
    variant = 'muted',
    id = 'how-it-works',
    className,
}: FinancingHowItWorksProps) {
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

                {/* Steps Timeline */}
                <div className='relative'>
                    {/* Connecting line - Desktop */}
                    <div className='bg-gold-500/30 absolute top-16 left-[calc(12.5%+24px)] hidden h-0.5 w-[calc(75%-48px)] lg:block' />

                    {/* Steps Grid */}
                    <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-4'>
                        {steps.map((step, idx) => {
                            const IconComponent = iconMap[step.icon]
                            return (
                                <motion.div
                                    key={step.step}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.5,
                                        delay: idx * 0.1,
                                    }}
                                    className='relative'
                                >
                                    {/* Step Card */}
                                    <div className='group flex flex-col items-center text-center'>
                                        {/* Step Number & Icon Container */}
                                        <div className='relative mb-6'>
                                            {/* Background circle */}
                                            <div className='bg-gold-500/10 flex h-20 w-20 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110'>
                                                {IconComponent && (
                                                    <IconComponent className='text-gold-500 h-8 w-8' />
                                                )}
                                            </div>

                                            {/* Step number badge */}
                                            <div className='bg-gold-500 absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white shadow-lg shadow-amber-500/30'>
                                                {step.step}
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <h3 className='mb-3 text-lg font-bold text-stone-900 dark:text-white'>
                                            {step.title}
                                        </h3>

                                        {/* Description */}
                                        <p className='text-muted-foreground mb-4 text-sm leading-relaxed'>
                                            {step.description}
                                        </p>

                                        {/* Duration badge */}
                                        {step.duration && (
                                            <span className='bg-gold-500/10 text-gold-600 dark:text-gold-400 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium'>
                                                {step.duration}
                                            </span>
                                        )}
                                    </div>

                                    {/* Mobile connecting line */}
                                    {idx < steps.length - 1 && (
                                        <div className='bg-gold-500/30 mx-auto mt-6 h-8 w-0.5 md:hidden' />
                                    )}
                                </motion.div>
                            )
                        })}
                    </div>
                </div>

                {/* Bottom CTA Text */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className='mt-16 text-center'
                >
                    <p className='text-muted-foreground text-sm'>
                        Questions about the process?{' '}
                        <Link
                            href='/contact-us'
                            className='text-gold-600 hover:text-gold-500 dark:text-gold-400 font-medium underline-offset-4 hover:underline'
                        >
                            Our team is here to help
                        </Link>
                    </p>
                </motion.div>
            </ContentWrapper>
        </SectionContainer>
    )
}

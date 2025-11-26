/**
 * FinancingHowItWorks Component - Simplified Version
 */
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
                <SectionHeader
                    badge={badge}
                    title={title}
                    description={description}
                    align='center'
                    spacing='loose'
                    className='mb-16 md:mb-20'
                />

                <div className='relative'>
                    <div className='absolute top-14 right-0 left-0 hidden lg:block'>
                        <div className='mx-auto h-1 w-[calc(100%-12rem)] rounded-full bg-stone-200/80' />
                        <div className='from-gold-400 via-gold-500 to-gold-400 absolute inset-0 mx-auto h-1 w-[calc(100%-12rem)] rounded-full bg-gradient-to-r opacity-60 blur-[2px]' />
                        <div className='from-gold-400 via-gold-500 to-gold-400 absolute inset-0 mx-auto h-0.5 w-[calc(100%-12rem)] translate-y-[1px] rounded-full bg-gradient-to-r' />
                    </div>

                    <ol className='grid gap-8 md:grid-cols-2 md:gap-12 lg:grid-cols-4 lg:gap-6'>
                        {steps.map((step, idx) => {
                            const IconComponent = iconMap[step.icon]
                            return (
                                <li key={step.step} className='relative'>
                                    <article className='group relative flex flex-col items-center text-center'>
                                        <div className='absolute -inset-4 rounded-2xl bg-white/0 transition-all duration-500 group-hover:bg-white/60 group-hover:shadow-xl group-hover:shadow-stone-200/50' />

                                        <div className='relative z-10 flex flex-col items-center px-2 py-4'>
                                            <div className='relative mb-8'>
                                                <div className='ring-gold-500/20 group-hover:ring-gold-500/30 absolute -inset-3 rounded-full bg-transparent ring-2 transition-all duration-500 group-hover:ring-4' />
                                                <div className='from-gold-500/15 to-gold-500/5 ring-gold-500/30 group-hover:ring-gold-500/50 relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ring-1 backdrop-blur-sm transition-all duration-500 group-hover:scale-105 group-hover:ring-2 md:h-28 md:w-28'>
                                                    {IconComponent && (
                                                        <IconComponent
                                                            className='text-gold-600 h-8 w-8 transition-transform duration-500 group-hover:scale-110'
                                                            strokeWidth={1.5}
                                                        />
                                                    )}
                                                </div>
                                                <div className='from-gold-500 to-gold-600 shadow-gold-500/40 group-hover:shadow-gold-500/50 absolute -top-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-base font-bold text-white shadow-lg ring-4 ring-white transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl md:text-lg'>
                                                    {step.step}
                                                </div>
                                            </div>
                                            <h3 className='group-hover:text-gold-700 mb-3 text-lg font-bold tracking-tight text-stone-900 transition-colors duration-300 md:text-xl'>
                                                {step.title}
                                            </h3>
                                            <p className='mb-5 max-w-[280px] text-sm leading-relaxed text-stone-600 md:text-[15px]'>
                                                {step.description}
                                            </p>
                                            <span className='from-gold-500/15 to-gold-500/5 text-gold-700 ring-gold-500/20 group-hover:ring-gold-500/40 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r px-4 py-1.5 text-xs font-semibold tracking-wide uppercase ring-1 transition-all duration-300'>
                                                <span className='bg-gold-500 h-1.5 w-1.5 rounded-full' />
                                                {step.duration ||
                                                    'Your Timeline'}
                                            </span>
                                        </div>

                                        {idx < steps.length - 1 && (
                                            <div className='from-gold-400 via-gold-500 to-gold-400 mx-auto mt-4 h-12 w-0.5 rounded-full bg-gradient-to-b md:mt-6 lg:hidden' />
                                        )}
                                    </article>
                                </li>
                            )
                        })}
                    </ol>
                </div>

                <div className='mt-16 text-center md:mt-20'>
                    <p className='text-sm text-stone-500'>
                        Questions about the process?{' '}
                        <Link
                            href='/contact-us'
                            className='text-gold-600 hover:text-gold-500 inline-flex items-center gap-1 font-semibold underline-offset-4 transition-colors hover:underline'
                        >
                            Our team is here to help
                            <span>→</span>
                        </Link>
                    </p>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}

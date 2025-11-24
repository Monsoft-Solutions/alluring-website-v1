'use client'

import { CheckCircle2, ShieldCheck, Sparkles, Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import type { ProcedureBenefit } from '@/lib/types/procedure.type'
import { SectionContainer } from '@/components/shared/section-container.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionHeader } from '@/components/shared/section-header.component'
import { cn } from '@workspace/ui/lib/utils'

interface ProcedureBenefitsProps {
    benefits: ProcedureBenefit[]
}

export function ProcedureBenefits({ benefits }: ProcedureBenefitsProps) {
    // Map for potential dynamic icons based on keywords in title
    const getIcon = (title: string) => {
        const t = title.toLowerCase()
        if (t.includes('natural')) return Sparkles
        if (t.includes('safe') || t.includes('scar')) return ShieldCheck
        if (
            t.includes('care') ||
            t.includes('personal') ||
            t.includes('comfort')
        )
            return Heart
        return CheckCircle2
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    }

    const item = {
        hidden: { opacity: 0, y: 30 },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: [0.21, 0.47, 0.32, 0.98],
            },
        },
    }

    return (
        <SectionContainer className='relative overflow-hidden bg-stone-50'>
            {/* Decorative background elements */}
            <div className='pointer-events-none absolute top-0 left-0 h-full w-full overflow-hidden'>
                <div className='absolute top-0 left-1/2 h-full w-full max-w-7xl -translate-x-1/2'>
                    {/* Subtle top gradient for depth */}
                    <div className='absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white/80 to-transparent opacity-60' />
                </div>
            </div>

            <ContentWrapper>
                <SectionHeader
                    badge='Why Choose This Procedure'
                    title='Benefits & Advantages'
                    description='We combine artistic vision with surgical precision to deliver results that enhance your natural beauty while prioritizing your safety and comfort.'
                    className='mb-20'
                />

                <motion.div
                    variants={container}
                    initial='hidden'
                    whileInView='show'
                    viewport={{ once: true, margin: '-100px' }}
                    className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'
                >
                    {benefits.map((benefit, index) => {
                        const Icon = getIcon(benefit.title)
                        return (
                            <motion.div
                                key={index}
                                variants={item}
                                className='group hover:border-gold-200 relative flex h-full flex-col rounded-xl border border-stone-100 bg-white p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(161,130,76,0.15)]'
                            >
                                {/* Icon Container */}
                                <div className='group-hover:bg-gold-50 group-hover:text-gold-600 mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-stone-50 text-stone-400 transition-all duration-500 group-hover:scale-110'>
                                    <Icon
                                        className='h-6 w-6'
                                        strokeWidth={1.5}
                                    />
                                </div>

                                {/* Content */}
                                <h3 className='mb-3 font-serif text-xl text-stone-900 transition-colors duration-300 group-hover:text-stone-950'>
                                    {benefit.title}
                                </h3>

                                <p className='flex-grow text-sm leading-relaxed font-light text-stone-500 transition-colors duration-300 group-hover:text-stone-600 md:text-base'>
                                    {benefit.description}
                                </p>

                                {/* Subtle accent line on hover */}
                                <div className='bg-gold-400 absolute bottom-0 left-0 h-1 w-0 rounded-b-xl transition-all duration-500 ease-out group-hover:w-full' />
                            </motion.div>
                        )
                    })}
                </motion.div>
            </ContentWrapper>
        </SectionContainer>
    )
}

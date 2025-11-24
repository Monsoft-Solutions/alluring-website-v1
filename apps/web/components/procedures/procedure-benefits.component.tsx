'use client'

import { CheckCircle2, ShieldCheck, Sparkles, Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import type { ProcedureBenefit } from '@/lib/types/procedure.type'
import { SectionContainer } from '@/components/shared/section-container.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionHeader } from '@/components/shared/section-header.component'

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
                staggerChildren: 0.15,
                delayChildren: 0.1,
            },
        },
    }

    const item = {
        hidden: { opacity: 0, y: 40 },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.9,
                ease: [0.22, 1, 0.36, 1] as const, // Custom easing for "luxury" feel
            },
        },
    }

    return (
        <SectionContainer className='relative overflow-hidden bg-stone-50/50'>
            {/* Decorative background elements */}
            <div className='pointer-events-none absolute top-0 left-0 h-full w-full overflow-hidden'>
                <div className='absolute top-0 left-1/2 h-full w-full max-w-7xl -translate-x-1/2'>
                    {/* Subtle top gradient for depth */}
                    <div className='absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white to-transparent opacity-80' />
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
                    className='grid gap-8 md:grid-cols-2 lg:grid-cols-4'
                >
                    {benefits.map((benefit, index) => {
                        const Icon = getIcon(benefit.title)
                        return (
                            <motion.div
                                key={index}
                                variants={item}
                                className='group relative flex h-full flex-col bg-white p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-stone-200/50'
                            >
                                {/* Border overlay that reveals on hover */}
                                <div className='group-hover:border-gold-200/50 pointer-events-none absolute inset-0 border border-stone-100 transition-colors duration-500' />

                                {/* Icon Container */}
                                <div className='group-hover:bg-gold-50 group-hover:text-gold-600 mb-8 inline-flex h-16 w-16 items-center justify-center rounded-full bg-stone-50 text-stone-400 transition-all duration-500 group-hover:scale-110'>
                                    <Icon
                                        className='h-7 w-7'
                                        strokeWidth={1.5}
                                    />
                                </div>

                                {/* Content */}
                                <h3 className='mb-4 font-serif text-2xl text-stone-900 transition-colors duration-300 group-hover:text-stone-950'>
                                    {benefit.title}
                                </h3>

                                <p className='flex-grow text-base leading-relaxed font-light text-stone-500 transition-colors duration-300 group-hover:text-stone-600'>
                                    {benefit.description}
                                </p>

                                {/* Subtle accent line on hover */}
                                <div className='bg-gold-500 absolute bottom-0 left-0 h-[2px] w-0 transition-all duration-700 ease-out group-hover:w-full' />
                            </motion.div>
                        )
                    })}
                </motion.div>
            </ContentWrapper>
        </SectionContainer>
    )
}

'use client'

import { useRef } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import type { ProcedureStep } from '@/lib/types/procedure.type'
import { ContainerLayout } from '@/components/container-layout.component'

interface ProcedureProcessProps {
    steps: ProcedureStep[]
}

export function ProcedureProcess({ steps }: ProcedureProcessProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start center', 'end center'],
    })

    const scaleY = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    })

    return (
        <section className='overflow-hidden bg-white py-24 lg:py-32'>
            <ContainerLayout>
                <div className='mb-16 grid gap-16 lg:grid-cols-2 lg:items-start'>
                    <div className='lg:sticky lg:top-32'>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <span className='text-gold-500 mb-6 block text-sm font-bold tracking-[0.2em] uppercase'>
                                The Journey
                            </span>
                            <h2 className='mb-8 font-serif text-4xl leading-tight text-stone-900 md:text-5xl lg:text-6xl'>
                                Your Path to{' '}
                                <span className='text-stone-400 italic'>
                                    Transformation
                                </span>
                            </h2>
                            <p className='max-w-md text-lg leading-relaxed font-light text-stone-600'>
                                From your initial consultation to your final
                                reveal, we guide you through every step with
                                expertise and care, ensuring a seamless and
                                comfortable experience.
                            </p>
                        </motion.div>
                    </div>

                    <div ref={containerRef} className='relative mt-8 lg:mt-0'>
                        {/* Vertical Line Background */}
                        <div className='absolute top-4 left-[27px] h-[calc(100%-40px)] w-[1px] bg-stone-100 lg:left-[27px]' />

                        {/* Vertical Line Progress */}
                        <motion.div
                            style={{ scaleY, originY: 0 }}
                            className='bg-gold-400 absolute top-4 left-[27px] z-10 h-[calc(100%-40px)] w-[1px] lg:left-[27px]'
                        />

                        <div className='space-y-16'>
                            {steps.map((step, index) => (
                                <ProcessStep
                                    key={step.step}
                                    step={step}
                                    index={index}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </ContainerLayout>
        </section>
    )
}

function ProcessStep({ step, index }: { step: ProcedureStep; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className='relative pl-24'
        >
            {/* Number Bubble */}
            <div className='group hover:border-gold-400 absolute top-0 left-0 z-20 flex h-14 w-14 items-center justify-center rounded-full border border-stone-100 bg-white shadow-sm transition-all duration-500 hover:scale-110'>
                <span className='group-hover:text-gold-600 font-serif text-xl font-medium text-stone-900 transition-colors duration-500'>
                    {step.step}
                </span>
            </div>

            <h3 className='mb-3 font-serif text-2xl font-medium text-stone-900'>
                {step.title}
            </h3>
            <p className='text-lg leading-relaxed font-light text-stone-600'>
                {step.description}
            </p>
        </motion.div>
    )
}

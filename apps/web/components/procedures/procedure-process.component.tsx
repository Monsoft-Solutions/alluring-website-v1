'use client'

import type { ProcedureStep } from '@/lib/types/procedure.type'
import { ContainerLayout } from '@/components/container-layout.component'
import { cn } from '@workspace/ui/lib/utils'

interface ProcedureProcessProps {
    steps: ProcedureStep[]
}

export function ProcedureProcess({ steps }: ProcedureProcessProps) {
    return (
        <section className='bg-white py-24'>
            <ContainerLayout>
                <div className='mb-16 grid gap-12 lg:grid-cols-2 lg:items-start'>
                    <div className='lg:sticky lg:top-32'>
                        <span className='text-gold-500 mb-4 block text-sm font-bold tracking-[0.2em] uppercase'>
                            The Journey
                        </span>
                        <h2 className='mb-6 font-serif text-4xl text-stone-900 md:text-5xl'>
                            Your Path to Transformation
                        </h2>
                        <p className='max-w-md text-lg leading-relaxed font-light text-stone-600'>
                            From your initial consultation to your final reveal,
                            we guide you through every step with expertise and
                            care.
                        </p>
                    </div>

                    <div className='relative'>
                        {/* Vertical Line */}
                        <div className='absolute top-4 left-[27px] h-[calc(100%-32px)] w-[2px] bg-stone-200 lg:left-[27px]' />

                        <div className='space-y-12'>
                            {steps.map((step) => (
                                <div key={step.step} className='relative pl-20'>
                                    {/* Number Bubble */}
                                    <div className='absolute top-0 left-0 flex h-14 w-14 items-center justify-center rounded-full border-4 border-stone-100 bg-white text-xl font-bold text-stone-900 shadow-sm'>
                                        {step.step}
                                    </div>

                                    <h3 className='mb-3 text-2xl font-semibold text-stone-900'>
                                        {step.title}
                                    </h3>
                                    <p className='text-lg leading-relaxed text-stone-600'>
                                        {step.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </ContainerLayout>
        </section>
    )
}

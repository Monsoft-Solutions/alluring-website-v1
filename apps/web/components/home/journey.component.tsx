'use client'

import { motion } from 'framer-motion'
import { SectionContainer } from '../shared/section-container.component'
import { ContentWrapper } from '../shared/content-wrapper.component'

export const Journey = () => {
    const steps = [
        {
            num: '01',
            title: 'The Conversation',
            desc: 'Share your goals over a private consult. Get realistic options from a surgeon, not a salesperson.',
        },
        {
            num: '02',
            title: 'The Custom Plan',
            desc: 'We map out your anatomy, recovery timeline, and all-inclusive financing options together.',
        },
        {
            num: '03',
            title: 'The Transformation',
            desc: 'From surgery day to your final follow-up, your dedicated concierge team is by your side.',
        },
    ]

    return (
        <SectionContainer
            id='experience'
            variant='default'
            className='relative z-20 overflow-hidden bg-stone-50'
            paddingY='py-24 lg:py-32'
        >
            <ContentWrapper size='lg' paddingX='px-6 md:px-12'>
                <div className='grid items-start gap-16 lg:grid-cols-2 lg:gap-24'>
                    {/* Left: Sticky Content */}
                    <div className='lg:sticky lg:top-32'>
                        <motion.span
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className='text-gold-500 mb-4 block text-sm font-bold tracking-widest uppercase'
                        >
                            Your Journey
                        </motion.span>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className='mb-8 font-serif text-4xl leading-tight text-stone-900 md:text-5xl lg:text-6xl'
                        >
                            Designed for Women Who Are Done{' '}
                            <span className='text-stone-400 italic'>
                                &quot;Just Dealing With It.&quot;
                            </span>
                        </motion.h2>
                        <p className='max-w-md text-xl leading-relaxed text-stone-600'>
                            At Alluring Plastic Surgery, we don&apos;t just
                            change how you look. We protect your health, respect
                            your time, and guide you through every decision with
                            full transparency.
                        </p>
                    </div>

                    {/* Right: Steps */}
                    <div className='relative border-l border-stone-200 pl-8 lg:border-none lg:pl-0'>
                        <div className='space-y-16'>
                            {steps.map((step, idx) => (
                                <motion.div
                                    key={idx}
                                    className='group relative'
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: '-100px' }}
                                    transition={{
                                        duration: 0.6,
                                        delay: idx * 0.1,
                                    }}
                                >
                                    {/* Number for Desktop */}
                                    <span className='group-hover:text-gold-300 absolute top-0 -left-24 hidden font-serif text-6xl text-stone-200 transition-colors duration-500 lg:block'>
                                        {step.num}
                                    </span>

                                    {/* Line connector for mobile visual */}
                                    <div className='border-gold-400 absolute top-2 -left-[33px] h-4 w-4 rounded-full border-2 bg-stone-100 lg:hidden'></div>

                                    <h3 className='mb-4 font-serif text-2xl text-stone-900 md:text-3xl'>
                                        {step.title}
                                    </h3>
                                    <p className='max-w-md text-lg leading-relaxed text-stone-500'>
                                        {step.desc}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}

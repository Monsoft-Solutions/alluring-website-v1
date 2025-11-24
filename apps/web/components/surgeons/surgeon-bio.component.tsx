'use client'

import { SectionContainer } from '../shared/section-container.component'
import { ContentWrapper } from '../shared/content-wrapper.component'
import { Surgeon } from '@/lib/types/surgeon.type'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

interface SurgeonBioProps {
    surgeon: Surgeon
}

export const SurgeonBio = ({ surgeon }: SurgeonBioProps) => {
    const containerRef = useRef<HTMLDivElement>(null)

    // For parallax text effect
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start end', 'end start'],
    })

    const y = useTransform(scrollYProgress, [0, 1], [100, -100])

    // Safely extract last name token for background text
    const parts = surgeon.name.trim().split(/\s+/).filter(Boolean)
    const bgText = parts.length > 1 ? parts[parts.length - 1] : surgeon.name

    return (
        <SectionContainer className='relative overflow-hidden bg-white'>
            {/* Decorative Background Text */}
            <motion.div
                style={{ y }}
                className='pointer-events-none absolute top-20 -left-20 font-serif text-[20vw] leading-none whitespace-nowrap text-stone-100 opacity-60 select-none'
            >
                {bgText}
            </motion.div>

            <ContentWrapper size='lg' className='relative z-10'>
                <div
                    className='flex flex-col gap-16 lg:flex-row lg:gap-32'
                    ref={containerRef}
                >
                    {/* Sticky Left Column */}
                    <div className='lg:w-5/12'>
                        <div className='lg:sticky lg:top-32'>
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                            >
                                <h2 className='mb-10 font-serif text-5xl leading-tight text-stone-900 md:text-6xl'>
                                    Philosophy & <br />
                                    <span className='text-gold-500 italic'>
                                        Approach
                                    </span>
                                </h2>
                                {surgeon.philosophy && (
                                    <blockquote className='mb-10 text-xl leading-relaxed font-light text-stone-600'>
                                        {surgeon.philosophy}
                                    </blockquote>
                                )}
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: 96 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                    className='bg-gold-400 h-[2px] w-24'
                                />
                            </motion.div>
                        </div>
                    </div>

                    {/* Scrolling Right Column */}
                    <div className='lg:w-7/12 lg:pt-24'>
                        <div className='prose prose-stone prose-lg md:prose-xl leading-loose font-light text-stone-600'>
                            {surgeon.fullBio
                                .split('\n\n')
                                .map((paragraph, index) => (
                                    <motion.p
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{
                                            once: true,
                                            margin: '-100px',
                                        }}
                                        transition={{
                                            duration: 0.6,
                                            delay: index * 0.1,
                                        }}
                                        className='mb-8'
                                    >
                                        {paragraph}
                                    </motion.p>
                                ))}
                        </div>
                    </div>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}

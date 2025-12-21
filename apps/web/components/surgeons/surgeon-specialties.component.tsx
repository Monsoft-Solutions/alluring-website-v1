'use client'

import { SectionContainer } from '../shared/section-container.component'
import { ContentWrapper } from '../shared/content-wrapper.component'
import type { Surgeon } from '@/lib/types/surgeon.type'
import { motion } from 'framer-motion'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { useState } from 'react'

interface SurgeonSpecialtiesProps {
    surgeon: Surgeon
}

export const SurgeonSpecialties = ({ surgeon }: SurgeonSpecialtiesProps) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

    return (
        <SectionContainer className='overflow-hidden bg-stone-900 text-white'>
            <ContentWrapper>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className='mb-20 text-center'
                >
                    <span className='text-gold-500 mb-4 block text-sm font-bold tracking-[0.2em] uppercase'>
                        Expertise
                    </span>
                    <h2 className='font-serif text-4xl md:text-6xl'>
                        Areas of Specialization
                    </h2>
                </motion.div>

                <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                    {surgeon.specialties.map((specialty, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            className='group relative overflow-hidden border border-stone-800 bg-stone-800/30 p-8 transition-all duration-500'
                            style={{
                                opacity:
                                    hoveredIndex !== null &&
                                    hoveredIndex !== index
                                        ? 0.4
                                        : 1,
                                scale: hoveredIndex === index ? 1.02 : 1,
                            }}
                        >
                            {/* Hover Gradient Background */}
                            <div className='from-gold-500/10 absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100' />

                            <div className='relative z-10 flex items-start justify-between'>
                                <div className='flex items-start gap-4'>
                                    <CheckCircle2 className='text-gold-500 mt-1 h-6 w-6 shrink-0 transition-transform duration-300 group-hover:scale-110' />
                                    <span className='text-xl font-light tracking-wide text-stone-200 transition-colors group-hover:text-white'>
                                        {specialty}
                                    </span>
                                </div>

                                <ArrowRight className='text-gold-500 h-5 w-5 -translate-x-4 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100' />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}

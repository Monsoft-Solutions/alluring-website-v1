'use client'

import { SectionContainer } from '../shared/section-container.component'
import { ContentWrapper } from '../shared/content-wrapper.component'
import { Surgeon } from '@/lib/types/surgeon.type'
import { Award, GraduationCap, Check } from 'lucide-react'
import { motion } from 'framer-motion'

interface SurgeonCredentialsProps {
    surgeon: Surgeon
}

export const SurgeonCredentials = ({ surgeon }: SurgeonCredentialsProps) => {
    return (
        <SectionContainer className='relative overflow-hidden bg-stone-50'>
            {/* Background Pattern */}
            <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(#af8a4d_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.03]' />

            <ContentWrapper>
                <div className='grid gap-8 lg:grid-cols-2 lg:gap-12'>
                    {/* Education Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className='group hover:border-gold-200 border border-stone-100 bg-white p-8 shadow-2xl shadow-stone-200/50 transition-colors duration-500 md:p-12'
                    >
                        <div className='text-gold-500 group-hover:bg-gold-500 mb-10 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-50 transition-colors duration-500 group-hover:text-white'>
                            <GraduationCap className='h-8 w-8' />
                        </div>
                        <h3 className='mb-8 font-serif text-3xl text-stone-900'>
                            Education & Training
                        </h3>
                        <ul className='space-y-6'>
                            {surgeon.education.map((edu, index) => (
                                <motion.li
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 + 0.3 }}
                                    className='flex gap-4'
                                >
                                    <span className='bg-gold-400 mt-1.5 h-2 w-2 shrink-0 rounded-full' />
                                    <span className='text-lg leading-relaxed font-light text-stone-600'>
                                        {edu}
                                    </span>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Certifications Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className='group bg-stone-900 p-8 text-white shadow-2xl shadow-stone-900/20 md:p-12'
                    >
                        <div className='text-gold-400 group-hover:bg-gold-500 mb-10 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-800 transition-colors duration-500 group-hover:text-white'>
                            <Award className='h-8 w-8' />
                        </div>
                        <h3 className='mb-8 font-serif text-3xl text-white'>
                            Board Certifications
                        </h3>
                        <ul className='space-y-6'>
                            {surgeon.certifications.map((cert, index) => (
                                <motion.li
                                    key={index}
                                    initial={{ opacity: 0, x: 10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 + 0.5 }}
                                    className='flex gap-4'
                                >
                                    <Check className='text-gold-500 mt-1 h-5 w-5 shrink-0' />
                                    <span className='text-lg leading-relaxed font-light text-stone-300'>
                                        {cert}
                                    </span>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}

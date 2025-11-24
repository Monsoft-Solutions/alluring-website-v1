/**
 * SurgeonPreview Component
 *
 * Teaser section showcasing the surgical team.
 * Links to the about/surgeons page for full details.
 *
 * Features:
 * - Surgeon cards with photos and specialties
 * - Hover animations and visual effects
 * - CTA to view full team
 */
'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'

import { SectionContainer } from '@/components/shared/section-container.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { surgeons } from '@/lib/data/surgeons/surgeons-data'

export type SurgeonPreviewProps = {
    readonly id?: string
}

export function SurgeonPreview({
    id = 'surgeons-preview',
}: SurgeonPreviewProps) {
    // Show first 3 surgeons
    const displayedSurgeons = surgeons.slice(0, 3)

    return (
        <SectionContainer
            id={id}
            variant='default'
            className='relative overflow-hidden'
            paddingY='py-24 lg:py-32'
        >
            {/* Background */}
            <div className='pointer-events-none absolute inset-0 bg-stone-100' />
            <div className="pointer-events-none absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diamond-upholstery.png')] opacity-[0.03]" />

            <ContentWrapper
                size='lg'
                paddingX='px-6 md:px-12'
                className='relative z-10'
            >
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className='mb-16 text-center'
                >
                    <div className='bg-gold-100 text-gold-600 mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase'>
                        <Sparkles className='h-3 w-3' />
                        Expert Care
                    </div>
                    <h2 className='mb-6 font-serif text-3xl text-stone-900 md:text-4xl lg:text-5xl'>
                        Meet Your Surgeons
                    </h2>
                    <p className='mx-auto max-w-2xl text-lg leading-relaxed text-stone-600'>
                        Board-certified specialists with decades of combined
                        experience. Your consultation will be with one of these
                        exceptional physicians.
                    </p>
                </motion.div>

                {/* Surgeons Grid */}
                <div className='mb-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
                    {displayedSurgeons.map((surgeon, index) => (
                        <motion.div
                            key={surgeon.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.15 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -8 }}
                            className='group'
                        >
                            <div className='hover:border-gold-200 h-full overflow-hidden border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl'>
                                {/* Image Container */}
                                <div className='relative aspect-[4/5] overflow-hidden bg-stone-200'>
                                    <Image
                                        src={surgeon.images.portrait}
                                        alt={surgeon.name}
                                        fill
                                        className='object-cover transition-transform duration-500 group-hover:scale-105'
                                        sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
                                    />
                                    {/* Gradient Overlay */}
                                    <div className='absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent' />

                                    {/* Name Overlay */}
                                    <div className='absolute right-0 bottom-0 left-0 p-6'>
                                        <h3 className='mb-1 font-serif text-2xl text-white'>
                                            {surgeon.name}
                                        </h3>
                                        <p className='text-gold-300 text-sm font-medium'>
                                            {surgeon.title}
                                        </p>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className='p-6'>
                                    <p className='mb-4 text-sm leading-relaxed text-stone-600'>
                                        {surgeon.shortBio}
                                    </p>

                                    {/* Specialties Preview */}
                                    <div className='flex flex-wrap gap-2'>
                                        {surgeon.specialties
                                            .slice(0, 3)
                                            .map((specialty) => (
                                                <span
                                                    key={specialty}
                                                    className='bg-gold-50 text-gold-700 px-2 py-1 text-xs font-medium'
                                                >
                                                    {specialty}
                                                </span>
                                            ))}
                                        {surgeon.specialties.length > 3 && (
                                            <span className='bg-stone-100 px-2 py-1 text-xs font-medium text-stone-500'>
                                                +
                                                {surgeon.specialties.length - 3}{' '}
                                                more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    viewport={{ once: true }}
                    className='text-center'
                >
                    <Button
                        asChild
                        variant='outline'
                        size='lg'
                        className='group'
                    >
                        <Link href='/about'>
                            Learn More About Our Team
                            <ArrowRight className='ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1' />
                        </Link>
                    </Button>
                </motion.div>
            </ContentWrapper>
        </SectionContainer>
    )
}

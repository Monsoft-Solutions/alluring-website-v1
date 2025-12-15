/**
 * Surgeons Grid Component
 *
 * Displays all surgeons in an elegant 3-column grid with hover effects.
 * Each card features grayscale to color transitions and links to individual surgeon pages.
 */

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { SectionContainer } from '@/components/shared/section-container.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { surgeons } from '@/lib/data/surgeons/surgeons-data'

export function SurgeonsGridSection() {
    return (
        <SectionContainer
            id='surgeons'
            variant='default'
            className='overflow-hidden bg-white'
            paddingY='py-24 lg:py-32'
        >
            <ContentWrapper size='lg' paddingX='px-6 md:px-12'>
                {/* Section Header */}
                <div className='mb-16 text-center'>
                    <span className='text-gold-500 mb-4 inline-block text-sm font-bold tracking-widest uppercase'>
                        World-Class Expertise
                    </span>
                    <h2 className='mb-6 font-serif text-4xl leading-tight text-stone-900 md:text-5xl lg:text-6xl'>
                        Meet Our{' '}
                        <span className='text-stone-400 italic'>Surgeons</span>
                    </h2>
                    <p className='mx-auto max-w-2xl text-xl leading-relaxed text-stone-600'>
                        Board-certified surgeons who combine technical mastery
                        with an artistic eye. Your transformation is guided by
                        years of experience and unwavering commitment to your
                        safety and satisfaction.
                    </p>
                </div>

                {/* Surgeons Grid */}
                <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
                    {surgeons.map((surgeon) => (
                        <Link
                            key={surgeon.id}
                            href={`/${surgeon.slug}`}
                            className='group block'
                        >
                            <div className='overflow-hidden bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl'>
                                {/* Surgeon Photo */}
                                <div className='relative aspect-[3/4] overflow-hidden'>
                                    <Image
                                        src={surgeon.images.featured}
                                        alt={surgeon.name}
                                        fill
                                        className='object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0'
                                        sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
                                    />
                                    {/* Overlay on hover */}
                                    <div className='absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />

                                    {/* View Profile Button (appears on hover) */}
                                    <div className='absolute inset-x-0 bottom-0 translate-y-full p-6 transition-transform duration-300 group-hover:translate-y-0'>
                                        <span className='flex items-center text-sm font-bold tracking-wider text-white uppercase'>
                                            View Profile
                                            <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
                                        </span>
                                    </div>
                                </div>

                                {/* Surgeon Info */}
                                <div className='p-6'>
                                    {/* Name */}
                                    <h3 className='group-hover:text-gold-600 mb-1 font-serif text-2xl text-stone-900 transition-colors'>
                                        {surgeon.name}
                                    </h3>

                                    {/* Title */}
                                    <p className='text-gold-600 mb-1 text-sm font-bold tracking-wider uppercase'>
                                        {surgeon.title}
                                    </p>

                                    {/* Role */}
                                    <p className='mb-4 text-sm text-stone-500'>
                                        {surgeon.role}
                                    </p>

                                    {/* Short Bio */}
                                    <p className='text-base leading-relaxed text-stone-600'>
                                        {surgeon.shortBio}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}

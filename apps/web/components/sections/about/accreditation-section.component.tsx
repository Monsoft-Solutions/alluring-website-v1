/**
 * Accreditation Section Component
 *
 * Dark background section showcasing trust badges, certifications, and safety credentials.
 * Emphasizes Double Board-Certified surgeons and safety credentials.
 */

import { ShieldCheck, Award, Star, Users, Heart, Plane } from 'lucide-react'

import { SectionContainer } from '@/components/shared/section-container.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { siteConfig } from '@/lib/data/site-config'

const accreditationBadges = [
    {
        icon: ShieldCheck,
        title: 'Double Board-Certified',
        description:
            'Every surgeon on our team is Double Board-Certified with specialized training in cosmetic and reconstructive surgery.',
    },
    {
        icon: Award,
        title: 'State-of-the-Art Facility',
        description:
            'Our modern surgical facility meets the highest safety standards with hospital-grade protocols and advanced equipment.',
    },
    {
        icon: Users,
        title: `${siteConfig.trustStats?.patients} Patients`,
        description:
            'Over 5,000 successful procedures performed with consistently exceptional outcomes and patient satisfaction.',
    },
    {
        icon: Star,
        title: `${siteConfig.trustStats?.rating} Star Rating`,
        description:
            'Consistently rated among the top plastic surgery practices in Miami on Google, RealSelf, and patient reviews.',
    },
    {
        icon: Heart,
        title: `${siteConfig.trustStats?.years} Years Experience`,
        description:
            'Over 15 years of combined surgical expertise serving Miami and international patients seeking world-class results.',
    },
    {
        icon: Plane,
        title: 'Built for Fly-In Patients',
        description:
            'Virtual consultations, and your surgery and follow-up dates confirmed in writing before you book travel. Care in English and Spanish.',
    },
]

export function AccreditationSection() {
    return (
        <SectionContainer
            id='accreditation'
            variant='default'
            className='relative overflow-hidden bg-stone-900 text-white'
            paddingY='py-24 lg:py-32'
        >
            {/* Background Decoration */}
            <div className='pointer-events-none absolute inset-0'>
                <div className='bg-gold-500/5 absolute top-0 right-0 h-[500px] w-[500px] rounded-full blur-[150px]' />
                <div className='absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-stone-700/20 blur-[100px]' />
            </div>

            <ContentWrapper
                size='lg'
                paddingX='px-6 md:px-12'
                className='relative z-10'
            >
                {/* Section Header */}
                <div className='mb-16 text-center'>
                    <span className='text-gold-400 mb-4 inline-block text-sm font-bold tracking-widest uppercase'>
                        Safety & Excellence
                    </span>
                    <h2 className='mb-6 font-serif text-4xl leading-tight text-white md:text-5xl lg:text-6xl'>
                        Accredited.{' '}
                        <span className='text-stone-400 italic'>
                            Certified.
                        </span>{' '}
                        Trusted.
                    </h2>
                    <p className='mx-auto max-w-2xl text-xl leading-relaxed text-stone-300'>
                        Your safety is our top priority. Our facility, surgeons,
                        and protocols meet the highest standards in the
                        industry—because you deserve nothing less than
                        excellence.
                    </p>
                </div>

                {/* Accreditation Grid */}
                <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
                    {accreditationBadges.map((badge, idx) => (
                        <div
                            key={idx}
                            className='group hover:border-gold-500/50 border border-stone-800 bg-stone-800/40 p-8 backdrop-blur-sm transition-all duration-300 hover:bg-stone-800/60'
                        >
                            {/* Icon */}
                            <div className='group-hover:bg-gold-500 mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-stone-700 text-stone-300 transition-all duration-300 group-hover:text-white'>
                                <badge.icon className='h-7 w-7' />
                            </div>

                            {/* Title */}
                            <h3 className='mb-3 font-serif text-xl font-bold text-white'>
                                {badge.title}
                            </h3>

                            {/* Description */}
                            <p className='text-base leading-relaxed text-stone-400'>
                                {badge.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Bottom Statement */}
                <div className='mt-16 border-t border-stone-800 pt-12 text-center'>
                    <p className='mx-auto max-w-3xl font-serif text-2xl leading-relaxed text-stone-300 italic'>
                        &quot;We don&apos;t just meet safety standards—we exceed
                        them. Every procedure, every patient, every time.&quot;
                    </p>
                    <div className='mt-6 flex items-center justify-center gap-2'>
                        <div className='bg-gold-400 h-[1px] w-12'></div>
                        <span className='text-sm font-bold tracking-widest text-stone-500 uppercase'>
                            Our Commitment
                        </span>
                        <div className='bg-gold-400 h-[1px] w-12'></div>
                    </div>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}

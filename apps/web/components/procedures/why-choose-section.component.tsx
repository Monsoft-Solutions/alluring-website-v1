'use client'

import { SectionContainer } from '@/components/shared/section-container.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { motion } from 'framer-motion'
import { Shield, UserCheck, HeartHandshake, Star, Sparkles } from 'lucide-react'
import { siteConfig } from '@/lib/data/site-config'

const features = [
    {
        icon: <UserCheck className='h-6 w-6' />,
        title: 'Board-Certified Surgeons',
        description:
            'Led by Dr. Victoria Karlinsky, our team consists of highly skilled, board-certified surgeons with decades of combined experience.',
    },
    {
        icon: <Shield className='h-6 w-6' />,
        title: 'Accredited Facility',
        description:
            'Our state-of-the-art surgical center meets the highest safety standards, ensuring your procedure is performed with precision and care.',
    },
    {
        icon: <HeartHandshake className='h-6 w-6' />,
        title: 'Concierge Experience',
        description:
            'From your first consultation to full recovery, we provide personalized attention tailored to your unique aesthetic goals.',
    },
    {
        icon: <Star className='h-6 w-6' />,
        title: 'Natural, Refined Results',
        description:
            "We prioritize outcomes that enhance your inherent beauty — results you'll love, that still look like you.",
    },
]

export function WhyChooseSection() {
    return (
        <SectionContainer
            id='why-choose-alluring'
            className='relative overflow-hidden'
            paddingY='py-24 lg:py-32'
            variant='default'
        >
            {/* Background Elements */}
            <div className='absolute inset-0 bg-stone-100' />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diamond-upholstery.png')] opacity-[0.03]" />

            {/* Decorative Blur Orbs */}
            <div className='bg-gold-400/10 pointer-events-none absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full blur-[120px]' />
            <div className='pointer-events-none absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-stone-400/10 blur-[100px]' />

            <ContentWrapper
                size='lg'
                paddingX='px-6 md:px-12'
                className='relative z-10'
            >
                <div className='grid items-start gap-12 lg:grid-cols-12 lg:gap-16'>
                    {/* Left Column - Headline & Introduction */}
                    <motion.div
                        className='lg:sticky lg:top-32 lg:col-span-5'
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                        viewport={{ once: true }}
                    >
                        {/* Badge */}
                        <div className='bg-gold-100 text-gold-700 mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase'>
                            <Sparkles className='h-3.5 w-3.5' />
                            The Alluring Difference
                        </div>

                        {/* Headline */}
                        <h2 className='mb-6 font-serif text-4xl leading-tight text-stone-900 md:text-5xl'>
                            Why Women Trust Alluring Plastic Surgery
                        </h2>

                        {/* Description */}
                        <p className='mb-8 text-xl leading-relaxed font-light text-stone-600'>
                            We combine world-class surgical expertise with a
                            luxury concierge experience. From your first
                            consultation to your full recovery, every detail is
                            designed around <em>you</em>.
                        </p>

                        {/* Gold Accent Line */}
                        <div className='bg-gold-400 h-1 w-20 shadow-[0_0_15px_rgba(234,179,8,0.3)]' />

                        {/* Trust Stats - Desktop Only */}
                        <div className='mt-12 hidden gap-8 lg:flex'>
                            <div>
                                <div className='text-gold-600 font-serif text-4xl font-bold'>
                                    {siteConfig.trustStats?.years ?? '15+'}
                                </div>
                                <div className='text-sm text-stone-500'>
                                    Years Experience
                                </div>
                            </div>
                            <div>
                                <div className='text-gold-600 font-serif text-4xl font-bold'>
                                    {siteConfig.trustStats?.patients ??
                                        '5,000+'}
                                </div>
                                <div className='text-sm text-stone-500'>
                                    Happy Patients
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column - Feature Cards */}
                    <div className='grid gap-5 sm:grid-cols-2 lg:col-span-7'>
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                className='hover:border-gold-200 group relative border border-stone-200/60 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl'
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -6 }}
                                transition={{
                                    duration: 0.6,
                                    delay: idx * 0.1,
                                    ease: [0.19, 1, 0.22, 1],
                                }}
                                viewport={{ once: true, margin: '-50px' }}
                            >
                                {/* Icon Container */}
                                <div className='group-hover:bg-gold-500 mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-stone-400 transition-all duration-300 group-hover:text-white group-hover:shadow-lg group-hover:shadow-amber-200/50'>
                                    {feature.icon}
                                </div>

                                {/* Title */}
                                <h3 className='group-hover:text-gold-700 mb-3 font-serif text-xl font-bold text-stone-900 transition-colors'>
                                    {feature.title}
                                </h3>

                                {/* Description */}
                                <p className='text-base leading-relaxed text-stone-500'>
                                    {feature.description}
                                </p>

                                {/* Hover Accent Line */}
                                <div className='bg-gold-400 absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full' />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}

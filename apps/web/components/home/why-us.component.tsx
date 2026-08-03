'use client'

import { SectionContainer } from '../shared/section-container.component'
import { ContentWrapper } from '../shared/content-wrapper.component'
import { motion } from 'framer-motion'
import {
    Plane,
    Shield,
    Sparkles,
    CalendarCheck,
    HeartHandshake,
} from 'lucide-react'

export const WhyUs = () => {
    const features = [
        {
            icon: <Plane className='h-6 w-6' />,
            title: 'Built for Fly-In Patients',
            desc: 'Meet your surgeon by video, get your surgery and follow-up dates in writing, and know exactly how many nights you need in Miami before you book a flight.',
        },
        {
            icon: <Shield className='h-6 w-6' />,
            title: 'Safety First',
            desc: 'From anesthesia protocols to infection control, we prioritize your health above aesthetics.',
        },
        {
            icon: <HeartHandshake className='h-6 w-6' />,
            title: 'Transparent Plans',
            desc: 'Concierge-level care minus the surprise fees. We walk you through every cost upfront.',
        },
        {
            icon: <CalendarCheck className='h-6 w-6' />,
            title: 'Flexible Scheduling',
            desc: 'We work around your lifestyle, school pickups, and work commitments.',
        },
    ]

    return (
        <SectionContainer
            className='relative overflow-hidden'
            paddingY='py-32'
            variant='default'
        >
            {/* Background Decor */}
            <div className='absolute inset-0 bg-stone-100'></div>
            <div className="absolute top-0 left-0 h-full w-full bg-[url('https://www.transparenttextures.com/patterns/diamond-upholstery.png')] opacity-[0.03]"></div>

            <ContentWrapper
                size='lg'
                paddingX='px-6 md:px-12'
                className='relative z-10'
            >
                <div className='grid items-center gap-12 lg:grid-cols-12'>
                    <div className='lg:col-span-5'>
                        <div className='bg-gold-100 text-gold-600 mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold tracking-widest uppercase'>
                            <Sparkles className='h-3 w-3' />
                            The Alluring Standard
                        </div>
                        <h2 className='mb-6 font-serif text-4xl leading-tight text-stone-900 md:text-5xl'>
                            Why Women Fly to Miami for Alluring
                        </h2>
                        <p className='mb-8 text-xl leading-relaxed font-light text-stone-600'>
                            Locals trust us, and patients fly in from around the
                            world. We blend a luxury vacation feel with
                            hospital-grade safety standards to create an
                            experience that puts you at ease.
                        </p>
                        <div className='bg-gold-400 h-1 w-20'></div>
                    </div>

                    <div className='grid gap-6 md:grid-cols-2 lg:col-span-7'>
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                className='hover:border-gold-200 group border border-stone-200/60 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl'
                                whileHover={{ y: -5 }}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <div className='group-hover:bg-gold-500 mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-stone-50 text-stone-400 transition-colors group-hover:text-white'>
                                    {feature.icon}
                                </div>
                                <h3 className='mb-3 font-serif text-xl font-bold text-stone-900'>
                                    {feature.title}
                                </h3>
                                <p className='text-base leading-relaxed text-stone-500'>
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}

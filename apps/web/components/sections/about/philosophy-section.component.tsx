/**
 * Philosophy Section Component
 *
 * Displays Alluring Plastic Surgery's three core philosophy pillars.
 * Uses 2-column layout with sticky headline (left) and content cards (right).
 * Matches the design pattern from Journey section on homepage.
 */

import { Shield, HeartHandshake, Sparkles } from 'lucide-react'

import { SectionContainer } from '@/components/shared/section-container.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'

const philosophyPillars = [
    {
        num: '01',
        icon: Shield,
        title: 'Safety First',
        description:
            'Hospital-grade protocols in our state-of-the-art facility. From anesthesia to infection control, we prioritize your health above aesthetics. Double Board-Certified surgeons who never compromise on safety standards.',
    },
    {
        num: '02',
        icon: HeartHandshake,
        title: 'Personalized Care',
        description:
            'Real consultations with surgeons, not salespeople. We listen to your goals, assess your anatomy, and create a custom surgical plan built around your unique needs. No cookie-cutter approaches.',
    },
    {
        num: '03',
        icon: Sparkles,
        title: 'Natural Results',
        description:
            'We enhance your natural beauty—never alter your identity. Our philosophy is simple: you should look like the best version of yourself, not a different person. Results that feel as authentic as they look.',
    },
]

export function PhilosophySection() {
    return (
        <SectionContainer
            id='philosophy'
            variant='default'
            className='relative z-20 overflow-hidden bg-stone-50'
            paddingY='py-24 lg:py-32'
        >
            <ContentWrapper size='lg' paddingX='px-6 md:px-12'>
                <div className='grid items-start gap-16 lg:grid-cols-2 lg:gap-24'>
                    {/* Left: Sticky Content */}
                    <div className='lg:sticky lg:top-32'>
                        <span className='text-gold-500 mb-4 block text-sm font-bold tracking-widest uppercase'>
                            Our Philosophy
                        </span>
                        <h2 className='mb-8 font-serif text-4xl leading-tight text-stone-900 md:text-5xl lg:text-6xl'>
                            Built on Three{' '}
                            <span className='text-stone-400 italic'>
                                Unshakeable Pillars.
                            </span>
                        </h2>
                        <p className='max-w-md text-xl leading-relaxed text-stone-600'>
                            At Alluring Plastic Surgery, every decision we make
                            is guided by these three principles—ensuring you
                            receive the highest standard of care, from
                            consultation to final result.
                        </p>
                        <div className='bg-gold-400 mt-8 h-1 w-20'></div>
                    </div>

                    {/* Right: Philosophy Pillars */}
                    <div className='relative border-l border-stone-200 pl-8 lg:border-none lg:pl-0'>
                        <div className='space-y-16'>
                            {philosophyPillars.map((pillar, idx) => (
                                <div key={idx} className='group relative'>
                                    {/* Number for Desktop */}
                                    <span className='group-hover:text-gold-300 absolute top-0 -left-24 hidden font-serif text-6xl text-stone-200 transition-colors duration-500 lg:block'>
                                        {pillar.num}
                                    </span>

                                    {/* Line connector for mobile visual */}
                                    <div className='border-gold-400 absolute top-2 -left-[33px] h-4 w-4 rounded-full border-2 bg-stone-100 lg:hidden'></div>

                                    {/* Icon */}
                                    <div className='group-hover:bg-gold-500 mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-stone-200 text-stone-600 transition-all duration-300 group-hover:text-white'>
                                        <pillar.icon className='h-7 w-7' />
                                    </div>

                                    {/* Title */}
                                    <h3 className='mb-4 font-serif text-2xl text-stone-900 md:text-3xl'>
                                        {pillar.title}
                                    </h3>

                                    {/* Description */}
                                    <p className='max-w-md text-lg leading-relaxed text-stone-500'>
                                        {pillar.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}

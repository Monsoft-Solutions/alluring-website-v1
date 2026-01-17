/**
 * TravelJourney Component
 *
 * A step-by-step journey section specifically for out-of-town patients.
 * Shows the complete process from virtual consultation to flying home.
 *
 * Server component for SEO optimization.
 */
import { Video, FileCheck, Plane, Heart, Home } from 'lucide-react'

import { SectionContainer } from '@/components/shared/section-container.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'

const JOURNEY_STEPS = [
    {
        number: '01',
        icon: Video,
        title: 'Speak with Our Specialists',
        description:
            'Connect with our patient specialists from anywhere. Discuss your goals, learn about procedures, and get your all-inclusive quote—all from home.',
        duration: 'Week 1',
    },
    {
        number: '02',
        icon: FileCheck,
        title: 'Plan Your Trip',
        description:
            'Once you decide to proceed, our team helps you plan: surgery date, recovery housing recommendations, and pre-op requirements.',
        duration: 'Weeks 2-4',
    },
    {
        number: '03',
        icon: Plane,
        title: 'Arrive in Miami',
        description:
            'Fly into Miami and settle into your recovery accommodation. Attend your in-person consultation and pre-op appointment with your surgeon.',
        duration: 'Day 1',
    },
    {
        number: '04',
        icon: Heart,
        title: 'Surgery & Recovery',
        description:
            'Your procedure takes place at our accredited facility. Recover in comfort with daily check-ins, nurse support, and scheduled follow-ups.',
        duration: 'Days 2-10',
    },
    {
        number: '05',
        icon: Home,
        title: 'Return Home Transformed',
        description:
            'Once cleared by your surgeon, fly home to reveal your results. We continue monitoring your progress through follow-up appointments.',
        duration: 'Day 10-14',
    },
] as const

export type TravelJourneyProps = {
    readonly id?: string
}

export function TravelJourney({ id = 'travel-journey' }: TravelJourneyProps) {
    return (
        <SectionContainer
            id={id}
            variant='default'
            className='relative overflow-hidden bg-white'
            paddingY='py-20 lg:py-28'
        >
            <ContentWrapper
                size='lg'
                paddingX='px-6 md:px-12'
                className='relative z-10'
            >
                {/* Section Header */}
                <div className='mx-auto mb-12 max-w-2xl text-center lg:mb-16'>
                    <div className='text-gold-500 mb-4 text-sm font-bold tracking-[0.2em] uppercase'>
                        Your Journey
                    </div>
                    <h2 className='mb-4 font-serif text-3xl text-stone-900 md:text-4xl'>
                        From Virtual Call to{' '}
                        <span className='text-gold-600 italic'>
                            Flying Home Transformed
                        </span>
                    </h2>
                    <p className='text-lg leading-relaxed text-stone-600'>
                        We&apos;ve perfected the fly-in experience. Here&apos;s
                        exactly what to expect at every step.
                    </p>
                </div>

                {/* Journey Timeline */}
                <div className='relative'>
                    {/* Connecting Line - Desktop */}
                    <div className='bg-gold-200 absolute top-24 right-0 left-0 hidden h-0.5 lg:block' />

                    {/* Steps Grid */}
                    <div className='grid gap-8 lg:grid-cols-5 lg:gap-6'>
                        {JOURNEY_STEPS.map((step, index) => (
                            <div
                                key={step.number}
                                className='relative flex flex-col items-center text-center'
                            >
                                {/* Step Number & Icon */}
                                <div className='relative mb-6'>
                                    {/* Duration Badge */}
                                    <div className='bg-gold-100 text-gold-700 absolute -top-6 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap'>
                                        {step.duration}
                                    </div>

                                    {/* Icon Circle */}
                                    <div className='border-gold-200 bg-gold-50 relative z-10 flex h-20 w-20 items-center justify-center rounded-full border-4'>
                                        <step.icon className='text-gold-600 h-8 w-8' />
                                    </div>

                                    {/* Step Number */}
                                    <div className='text-gold-400 absolute -right-2 -bottom-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold shadow-md'>
                                        {step.number}
                                    </div>
                                </div>

                                {/* Content */}
                                <h3 className='mb-3 font-serif text-lg font-semibold text-stone-900'>
                                    {step.title}
                                </h3>
                                <p className='text-sm leading-relaxed text-stone-600'>
                                    {step.description}
                                </p>

                                {/* Arrow for mobile */}
                                {index < JOURNEY_STEPS.length - 1 && (
                                    <div className='text-gold-300 mt-6 text-2xl lg:hidden'>
                                        ↓
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className='mt-16 text-center'>
                    <div className='inline-flex flex-col items-center gap-4 rounded-xl border border-stone-200 bg-stone-50 px-8 py-6 sm:flex-row'>
                        <p className='text-stone-700'>
                            <span className='font-semibold text-stone-900'>
                                Ready to start your journey?
                            </span>{' '}
                            Speak with our specialists today.
                        </p>
                        <a
                            href='#hero-form'
                            className='bg-gold-500 hover:bg-gold-600 inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-white shadow-lg transition-colors'
                        >
                            Get Started
                            <span aria-hidden='true'>↑</span>
                        </a>
                    </div>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}

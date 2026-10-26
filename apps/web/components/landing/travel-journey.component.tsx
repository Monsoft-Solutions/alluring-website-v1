/**
 * TravelJourney Component
 *
 * A step-by-step journey section specifically for out-of-town patients.
 * Shows the complete process from virtual consultation to flying home.
 *
 * No day counts per step: the surgeon sets each patient's schedule and the
 * number of nights to stay in Miami (claims canon §8). No facility claim and
 * no travel arranged by the practice.
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
        title: 'Your Video Consultation',
        description:
            'Have your consultation by video, from home. Discuss your goals and the procedures, and your surgeon confirms your price in writing.',
    },
    {
        number: '02',
        icon: FileCheck,
        title: 'Plan Your Trip',
        description:
            'Once you decide to proceed we confirm your surgery date, pre-op requirements and follow-up appointments in writing — so you can arrange the travel itself around a fixed schedule.',
    },
    {
        number: '03',
        icon: Plane,
        title: 'Arrive in Miami',
        description:
            'Fly into Miami and attend your in-person consultation and pre-op appointment with your surgeon.',
    },
    {
        number: '04',
        icon: Heart,
        title: 'Surgery & Recovery',
        description:
            'Your procedure takes place in Miami. You go home the same day with written post-op instructions, scheduled follow-up appointments, and a number to call if something does not look right.',
    },
    {
        number: '05',
        icon: Home,
        title: 'Return Home Transformed',
        description:
            'Once cleared by your surgeon, fly home to reveal your results. We continue monitoring your progress through follow-up appointments.',
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
                        If you&apos;re flying in, here&apos;s exactly what to
                        expect at every step.
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
                            Start with a video consultation.
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

/**
 * WhyTravelMiami Component
 *
 * A section for patients flying in from other US states:
 * - Recovery in Miami's weather
 * - Surgery and follow-up dates confirmed before travel is booked
 * - Privacy away from home
 *
 * SCOPE: the practice coordinates no travel — no flights, lodging or
 * transport, and no recovery-house affiliation. Do not add "concierge"
 * support claims here, and no claims about Miami's surgeons or facilities
 * (claims canon §2, §3, §10).
 *
 * Server component for SEO optimization.
 */
import { Plane, Sun, Eye } from 'lucide-react'

import { SectionContainer } from '@/components/shared/section-container.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'

const TRAVEL_BENEFITS = [
    {
        icon: Sun,
        title: 'Recover in Paradise',
        description:
            'Trade gray skies for Miami sunshine. Recover with warm weather and a relaxed pace.',
        highlight: 'Sunny Recovery',
    },
    {
        icon: Plane,
        title: 'Your Dates, Before You Book',
        description:
            'You get your surgery, pre-op and follow-up dates in writing first, plus the number of nights you need to stay before your surgeon clears you to fly home. You arrange the travel itself, around a schedule that is already fixed.',
        highlight: 'No Guesswork',
    },
    {
        icon: Eye,
        title: 'Privacy & Discretion',
        description:
            'Recover away from prying eyes. No running into coworkers or neighbors. Return home and reveal your new look on your own terms.',
        highlight: 'Privacy',
    },
] as const

export type WhyTravelMiamiProps = {
    readonly id?: string
}

export function WhyTravelMiami({ id = 'why-travel' }: WhyTravelMiamiProps) {
    return (
        <SectionContainer
            id={id}
            variant='default'
            className='relative overflow-hidden bg-stone-50'
            paddingY='py-20 lg:py-28'
        >
            {/* Subtle Background */}
            <div className='pointer-events-none absolute inset-0'>
                <div className='bg-gold-100/20 absolute -top-[10%] right-[5%] h-[400px] w-[400px] rounded-full blur-3xl' />
                <div className='absolute bottom-[5%] left-[10%] h-[300px] w-[300px] rounded-full bg-stone-200/50 blur-3xl' />
            </div>

            <ContentWrapper
                size='lg'
                paddingX='px-6 md:px-12'
                className='relative z-10'
            >
                {/* Section Header */}
                <div className='mx-auto mb-12 max-w-2xl text-center lg:mb-16'>
                    <div className='text-gold-500 mb-4 text-sm font-bold tracking-[0.2em] uppercase'>
                        Why Miami?
                    </div>
                    <h2 className='mb-4 font-serif text-3xl text-stone-900 md:text-4xl'>
                        Flying in from{' '}
                        <span className='text-gold-600 italic'>
                            another state?
                        </span>
                    </h2>
                    <p className='text-lg leading-relaxed text-stone-600'>
                        Here&apos;s what to expect if you fly in.
                    </p>
                </div>

                {/* Benefits Grid */}
                <div className='grid gap-8 md:grid-cols-3'>
                    {TRAVEL_BENEFITS.map((benefit) => (
                        <article
                            key={benefit.title}
                            className='hover:border-gold-200 group relative rounded-xl border border-stone-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg'
                        >
                            {/* Highlight Badge */}
                            <div className='bg-gold-100 text-gold-700 absolute -top-3 right-6 rounded-full px-3 py-1 text-xs font-semibold'>
                                {benefit.highlight}
                            </div>

                            {/* Icon */}
                            <div className='group-hover:bg-gold-500 mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 transition-colors duration-300 group-hover:text-white'>
                                <benefit.icon className='text-gold-600 h-7 w-7 group-hover:text-white' />
                            </div>

                            {/* Title */}
                            <h3 className='mb-4 font-serif text-xl font-semibold text-stone-900'>
                                {benefit.title}
                            </h3>

                            {/* Description */}
                            <p className='leading-relaxed text-stone-600'>
                                {benefit.description}
                            </p>
                        </article>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className='mt-12 text-center'>
                    <p className='text-lg text-stone-700'>
                        <span className='font-semibold text-stone-900'>
                            Ready to plan your trip?
                        </span>{' '}
                        Start with a free virtual consultation from anywhere in
                        the U.S.
                    </p>
                    <a
                        href='#hero-form'
                        className='text-gold-600 hover:text-gold-700 mt-3 inline-flex items-center gap-2 font-medium transition-colors'
                    >
                        Schedule your virtual consultation
                        <span aria-hidden='true'>↑</span>
                    </a>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}

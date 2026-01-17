/**
 * WhyTravelMiami Component
 *
 * A section highlighting why patients travel to Miami for plastic surgery:
 * - World-class surgeons at competitive prices
 * - Recovery in a beautiful destination
 * - Full concierge support
 * - Privacy away from home
 *
 * Server component for SEO optimization.
 */
import { Plane, Sun, Shield, Eye } from 'lucide-react'

import { SectionContainer } from '@/components/shared/section-container.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'

const TRAVEL_BENEFITS = [
    {
        icon: Shield,
        title: 'World-Class Surgeons, Better Value',
        description:
            'Miami is a global hub for cosmetic surgery. Our board-certified surgeons perform thousands of procedures yearly—expertise that often costs 30-50% more in other major cities.',
        highlight: 'Premium Results',
    },
    {
        icon: Sun,
        title: 'Recover in Paradise',
        description:
            'Trade gray skies for Miami sunshine. Recover in a beautiful oceanside setting with warm weather, fresh air, and a relaxed atmosphere that promotes healing.',
        highlight: 'Sunny Recovery',
    },
    {
        icon: Plane,
        title: 'Dedicated Concierge Support',
        description:
            'From your first virtual call to your flight home, we guide you every step. Our specialists provide trusted recommendations for recovery accommodations, answer all your questions, and ensure you feel prepared and supported.',
        highlight: 'Expert Guidance',
    },
    {
        icon: Eye,
        title: 'Privacy & Discretion',
        description:
            'Recover away from prying eyes. No running into coworkers or neighbors. Return home fully healed, refreshed, and ready to reveal your new look on your own terms.',
        highlight: 'Total Privacy',
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
                        Thousands Fly to Miami for{' '}
                        <span className='text-gold-600 italic'>
                            This Experience
                        </span>
                    </h2>
                    <p className='text-lg leading-relaxed text-stone-600'>
                        There&apos;s a reason Miami is a top destination for
                        cosmetic surgery. Here&apos;s what makes the trip worth
                        it.
                    </p>
                </div>

                {/* Benefits Grid */}
                <div className='grid gap-8 md:grid-cols-2'>
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
                        Start with a free virtual consultation from anywhere.
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

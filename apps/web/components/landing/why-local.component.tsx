/**
 * WhyLocal Component
 *
 * A section highlighting the benefits of choosing a local Miami surgeon
 * over traveling for surgery. Addresses common concerns about:
 * - Convenience and accessibility
 * - Community trust and references
 * - Follow-up care proximity
 * - Emergency access
 *
 * Server component for SEO optimization.
 */
import { MapPin, Users, Heart, Shield } from 'lucide-react'

import { SectionContainer } from '@/components/shared/section-container.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'

const LOCAL_BENEFITS = [
    {
        icon: MapPin,
        title: 'Minutes, Not Miles Away',
        description:
            "No flights, no hotels, no time away from family. Your surgeon's office is right here in Coral Gables—convenient for consultations, surgery, and follow-ups.",
        highlight: 'Local Convenience',
    },
    {
        icon: Users,
        title: 'Ask Your Neighbors',
        description:
            "We've served Miami families for 15+ years. Ask around—chances are someone you know has trusted us. Real results you can see in your own community.",
        highlight: 'Community Trust',
    },
    {
        icon: Heart,
        title: 'Recovery at Home',
        description:
            'Recover in your own bed, surrounded by family. Your follow-up appointments are a short drive away, not a cross-country trip.',
        highlight: 'Home Recovery',
    },
    {
        icon: Shield,
        title: 'Always Here for You',
        description:
            "If you ever have a concern during recovery, we're nearby. No waiting for emergency appointments across the country—your surgical team is right here in Miami.",
        highlight: '24/7 Support',
    },
] as const

export type WhyLocalProps = {
    readonly id?: string
}

export function WhyLocal({ id = 'why-local' }: WhyLocalProps) {
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
                        The Local Advantage
                    </div>
                    <h2 className='mb-4 font-serif text-3xl text-stone-900 md:text-4xl'>
                        Why Miami Chooses{' '}
                        <span className='text-gold-600 italic'>Local</span>
                    </h2>
                    <p className='text-lg leading-relaxed text-stone-600'>
                        When it comes to plastic surgery, there&apos;s no place
                        like home. Here&apos;s why your neighbors trust their
                        local Miami surgeons.
                    </p>
                </div>

                {/* Benefits Grid */}
                <div className='grid gap-8 md:grid-cols-2'>
                    {LOCAL_BENEFITS.map((benefit) => (
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
                            Ready to meet your local surgeon?
                        </span>{' '}
                        Schedule your free consultation at our Coral Gables
                        office today.
                    </p>
                    <a
                        href='#hero-form'
                        className='text-gold-600 hover:text-gold-700 mt-3 inline-flex items-center gap-2 font-medium transition-colors'
                    >
                        Book your consultation
                        <span aria-hidden='true'>↑</span>
                    </a>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}

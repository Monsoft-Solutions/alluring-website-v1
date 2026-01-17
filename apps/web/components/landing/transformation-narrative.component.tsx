/**
 * TransformationNarrative Component
 *
 * A section that creates emotional resonance through pain point messaging.
 * Three cards addressing core struggles that resonate with the target audience:
 * 1. "I Don't Feel Confident Anymore" - about body changes
 * 2. "I Can't Stop Hiding" - about avoidance behaviors
 * 3. "I'm Ready to Invest in Myself" - about the self-care moment
 *
 * Server component for SEO optimization.
 */
import { Heart, Eye, Sparkles } from 'lucide-react'

import { SectionContainer } from '@/components/shared/section-container.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'

const NARRATIVE_CARDS = [
    {
        icon: Heart,
        title: "I Don't Feel Confident Anymore",
        description:
            "Your body has changed—after pregnancy, weight fluctuations, or simply time. You look in the mirror and don't recognize who's looking back. You deserve to feel at home in your own skin again.",
        highlight: 'Body Changes',
    },
    {
        icon: Eye,
        title: "I Can't Stop Hiding",
        description:
            'You avoid photos, skip beach trips, and carefully choose clothes that conceal instead of celebrate. Life is too short to hide. Imagine walking into any room with quiet confidence.',
        highlight: 'Self-Conscious',
    },
    {
        icon: Sparkles,
        title: "I'm Ready to Invest in Myself",
        description:
            "You've put everyone else first for years. Now it's your turn. This isn't vanity—it's self-care. It's choosing to feel as vibrant on the outside as you do on the inside.",
        highlight: 'Your Moment',
    },
] as const

export type TransformationNarrativeProps = {
    readonly id?: string
}

export function TransformationNarrative({
    id = 'transformation-narrative',
}: TransformationNarrativeProps) {
    return (
        <SectionContainer
            id={id}
            variant='default'
            className='relative overflow-hidden bg-stone-50'
            paddingY='py-20 lg:py-28'
        >
            {/* Subtle Background */}
            <div className='pointer-events-none absolute inset-0'>
                <div className='bg-gold-100/20 absolute -top-[10%] left-[5%] h-[400px] w-[400px] rounded-full blur-3xl' />
                <div className='absolute right-[10%] bottom-[5%] h-[300px] w-[300px] rounded-full bg-stone-200/50 blur-3xl' />
            </div>

            <ContentWrapper
                size='lg'
                paddingX='px-6 md:px-12'
                className='relative z-10'
            >
                {/* Section Header */}
                <div className='mx-auto mb-12 max-w-2xl text-center lg:mb-16'>
                    <div className='text-gold-500 mb-4 text-sm font-bold tracking-[0.2em] uppercase'>
                        We Understand
                    </div>
                    <h2 className='mb-4 font-serif text-3xl text-stone-900 md:text-4xl'>
                        This Feeling is{' '}
                        <span className='text-gold-600 italic'>
                            More Common Than You Think
                        </span>
                    </h2>
                    <p className='text-lg leading-relaxed text-stone-600'>
                        You&apos;re not alone. Thousands of women have felt
                        exactly what you&apos;re feeling right now—and found
                        their way back to confidence.
                    </p>
                </div>

                {/* Narrative Cards Grid */}
                <div className='grid gap-8 md:grid-cols-3'>
                    {NARRATIVE_CARDS.map((card) => (
                        <article
                            key={card.title}
                            className='hover:border-gold-200 group relative rounded-xl border border-stone-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg'
                        >
                            {/* Highlight Badge */}
                            <div className='bg-gold-100 text-gold-700 absolute -top-3 right-6 rounded-full px-3 py-1 text-xs font-semibold'>
                                {card.highlight}
                            </div>

                            {/* Icon */}
                            <div className='group-hover:bg-gold-500 mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 transition-colors duration-300 group-hover:text-white'>
                                <card.icon className='text-gold-600 h-7 w-7 group-hover:text-white' />
                            </div>

                            {/* Title */}
                            <h3 className='mb-4 font-serif text-xl font-semibold text-stone-900'>
                                &ldquo;{card.title}&rdquo;
                            </h3>

                            {/* Description */}
                            <p className='leading-relaxed text-stone-600'>
                                {card.description}
                            </p>
                        </article>
                    ))}
                </div>

                {/* Transition to Hope */}
                <div className='mt-12 text-center'>
                    <p className='text-lg text-stone-700'>
                        <span className='font-semibold text-stone-900'>
                            The good news?
                        </span>{' '}
                        You don&apos;t have to stay stuck. Thousands of women
                        have taken the first step—and you can too.
                    </p>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}

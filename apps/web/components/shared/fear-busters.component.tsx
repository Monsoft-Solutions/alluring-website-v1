/**
 * FearBusters Component
 *
 * A section that directly addresses the 4 main psychological barriers
 * preventing potential patients from taking action:
 * 1. Affordability concerns
 * 2. Safety fears
 * 3. Fear of unnatural results
 * 4. Commitment anxiety
 *
 * Designed to reduce friction and build confidence at the decision point.
 * Used on both specials and contact pages.
 */
import { CreditCard, ShieldCheck, Sparkles, Heart } from 'lucide-react'

import { SectionContainer } from '@/components/shared/section-container.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'

const FEAR_BUSTERS = [
    {
        icon: CreditCard,
        question: 'Can I afford this?',
        answer: 'Flexible financing starting at just $27/week. Many patients qualify for 0% APR. Your investment, your terms.',
        highlight: 'From $27/week',
    },
    {
        icon: ShieldCheck,
        question: 'Is it safe?',
        answer: 'Double Board-Certified surgeons. State-of-the-art facility. 5,000+ procedures performed with exceptional safety record.',
        highlight: 'Double Board-Certified',
    },
    {
        icon: Sparkles,
        question: 'Will I look natural?',
        answer: 'Our surgeons specialize in subtle, natural-looking enhancements. The goal is always "you, enhanced" — never overdone.',
        highlight: 'Natural Results',
    },
    {
        icon: Heart,
        question: "What if I'm not ready?",
        answer: "No obligation. Your consultation is 100% free. We're here to answer questions, not pressure you.",
        highlight: 'No Pressure',
    },
] as const

export type FearBustersProps = {
    readonly id?: string
    /** Anchor link for the form CTA (default: #contact-form) */
    readonly formAnchor?: string
}

export function FearBusters({
    id = 'fear-busters',
    formAnchor = '#contact-form',
}: FearBustersProps) {
    return (
        <SectionContainer
            id={id}
            variant='default'
            className='relative overflow-hidden bg-white'
            paddingY='py-20 lg:py-28'
        >
            {/* Subtle Background */}
            <div className='pointer-events-none absolute inset-0'>
                <div className='bg-gold-100/20 absolute -top-[20%] left-[10%] h-[400px] w-[400px] rounded-full blur-3xl' />
                <div className='absolute right-[5%] bottom-[10%] h-[300px] w-[300px] rounded-full bg-stone-100 blur-3xl' />
            </div>

            <ContentWrapper
                size='lg'
                paddingX='px-6 md:px-12'
                className='relative z-10'
            >
                {/* Section Header */}
                <div className='mx-auto mb-12 max-w-2xl text-center lg:mb-16'>
                    <div className='text-gold-500 mb-4 text-sm font-bold tracking-[0.2em] uppercase'>
                        We Understand Your Concerns
                    </div>
                    <h2 className='mb-4 font-serif text-3xl text-stone-900 md:text-4xl'>
                        Questions You Might Be{' '}
                        <span className='text-gold-600 italic'>Asking</span>
                    </h2>
                    <p className='text-lg leading-relaxed text-stone-600'>
                        Every transformation starts with questions. Here are
                        honest answers to what&apos;s probably on your mind.
                    </p>
                </div>

                {/* Fear Busters Grid */}
                <div className='grid gap-6 md:grid-cols-2'>
                    {FEAR_BUSTERS.map((item) => (
                        <div
                            key={item.question}
                            className='hover:border-gold-200 group relative rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg md:p-8'
                        >
                            {/* Highlight Badge */}
                            <div className='bg-gold-100 text-gold-700 absolute -top-3 right-6 rounded-full px-3 py-1 text-xs font-semibold'>
                                {item.highlight}
                            </div>

                            {/* Icon */}
                            <div className='group-hover:bg-gold-500 mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-stone-100 transition-colors duration-300 group-hover:text-white'>
                                <item.icon className='text-gold-600 h-6 w-6 group-hover:text-white' />
                            </div>

                            {/* Question */}
                            <h3 className='mb-3 font-serif text-xl font-semibold text-stone-900'>
                                &ldquo;{item.question}&rdquo;
                            </h3>

                            {/* Answer */}
                            <p className='leading-relaxed text-stone-600'>
                                {item.answer}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className='mt-12 text-center'>
                    <p className='text-stone-600'>
                        <span className='font-semibold text-stone-900'>
                            Still have questions?
                        </span>{' '}
                        Our patient concierge is happy to answer anything — zero
                        pressure, zero sales pitch.
                    </p>
                    <a
                        href={formAnchor}
                        className='text-gold-600 hover:text-gold-700 mt-3 inline-flex items-center gap-2 font-medium transition-colors'
                    >
                        Get your questions answered
                        <span aria-hidden='true'>↑</span>
                    </a>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}

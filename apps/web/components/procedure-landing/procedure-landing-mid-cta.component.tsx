/**
 * ProcedureLandingMidCTA
 *
 * Mid-page conversion punch that sits between social-proof sections and
 * the financing/FAQ stack. Dark glass on gold so it visually separates
 * the page into "above the decision" and "ready to act" halves without
 * adding another sticky element to compete with the mobile bar.
 */
import { ArrowRight, MessageCircle, ShieldCheck } from 'lucide-react'

import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'

export type ProcedureLandingMidCTAProps = {
    readonly id?: string
    readonly procedureTitle: string
    readonly formAnchor?: string
}

export function ProcedureLandingMidCTA({
    id = 'mid-cta',
    procedureTitle,
    formAnchor = '#hero-form',
}: ProcedureLandingMidCTAProps) {
    const cleanTitle = procedureTitle.replace(/\s*Miami\s*$/i, '')

    return (
        <SectionContainer
            id={id}
            variant='default'
            className='relative overflow-hidden bg-stone-950'
            paddingY='py-16 lg:py-20'
        >
            <div
                aria-hidden='true'
                className='pointer-events-none absolute inset-0'
            >
                <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.18),_transparent_55%)]' />
                <div className='bg-gold-500/10 absolute -bottom-1/3 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full blur-3xl' />
            </div>

            <ContentWrapper
                size='lg'
                paddingX='px-6 md:px-12'
                className='relative z-10'
            >
                <div className='mx-auto flex max-w-3xl flex-col items-center gap-6 text-center'>
                    <span className='border-gold-500/30 bg-gold-500/10 inline-flex items-center gap-2 rounded-full border px-3 py-1.5'>
                        <MessageCircle className='text-gold-400 h-3.5 w-3.5' />
                        <span className='text-gold-300 text-xs font-medium tracking-wide uppercase'>
                            Free · No pressure
                        </span>
                    </span>

                    <h2 className='font-serif text-3xl leading-tight text-white md:text-4xl lg:text-5xl'>
                        Get a personalized{' '}
                        <span className='text-gold-300 italic'>
                            {cleanTitle}
                        </span>{' '}
                        plan in under 24 hours.
                    </h2>

                    <p className='max-w-xl text-base leading-relaxed text-stone-300 lg:text-lg'>
                        Tell us a little about you and we&apos;ll text you with
                        a quote, financing options, and a few times that work
                        for your consult. That&apos;s it.
                    </p>

                    <div className='mt-2 flex flex-col items-center gap-3 sm:flex-row sm:gap-4'>
                        <a
                            href={formAnchor}
                            className='from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r px-8 py-4 text-base font-bold tracking-wide text-stone-950 shadow-xl shadow-amber-500/30 transition-all hover:shadow-2xl hover:shadow-amber-500/40 active:scale-[0.98]'
                        >
                            Get My Free Quote
                            <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-0.5' />
                        </a>
                    </div>

                    <p className='mt-1 inline-flex items-center gap-1.5 text-xs text-stone-500'>
                        <ShieldCheck className='text-gold-400 h-3.5 w-3.5' />
                        We never spam, sell, or share your data.
                    </p>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}

/**
 * FinancingSection Component
 *
 * The financing band on the consultation and landing pages. It names the
 * lenders and quotes no number (claims canon §6, decision D6): no weekly or
 * monthly payment, no APR, no term, no "as low as", no approval claim. A
 * payment amount or a rate is a Truth in Lending trigger term, and the
 * weekly figures this band used to show are not on the practice's price
 * sheet.
 *
 * Replaces `WeeklyPayments` (issue #354), with the same props, so each page
 * keeps its anchor and form link.
 *
 * Server component; no client JavaScript.
 */
import { CreditCard, Languages } from 'lucide-react'

import {
    FINANCING_PAGE_PATH,
    FINANCING_PARTNERS,
    FINANCING_SENTENCE_LONG,
} from '@workspace/shared/claims/financing'

import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'

export type FinancingSectionProps = {
    readonly id?: string
    /** Anchor link for the form CTA (default: #contact-form) */
    readonly formAnchor?: string
}

export function FinancingSection({
    id = 'financing',
    formAnchor = '#contact-form',
}: FinancingSectionProps) {
    return (
        <SectionContainer
            id={id}
            variant='default'
            className='relative overflow-hidden bg-stone-900'
            paddingY='py-20 lg:py-28'
        >
            {/* Background Accents */}
            <div className='pointer-events-none absolute inset-0'>
                <div className='bg-gold-600/10 absolute -top-[20%] left-[10%] h-[500px] w-[500px] rounded-full blur-3xl' />
                <div className='bg-gold-500/5 absolute right-[5%] bottom-[10%] h-[400px] w-[400px] rounded-full blur-3xl' />
            </div>

            <ContentWrapper
                size='lg'
                paddingX='px-6 md:px-12'
                className='relative z-10'
            >
                <div className='mx-auto mb-12 max-w-2xl text-center lg:mb-16'>
                    <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2'>
                        <CreditCard className='text-gold-400 h-4 w-4' />
                        <span className='text-gold-400 text-sm font-medium'>
                            Financing
                        </span>
                    </div>

                    <h2 className='mb-4 font-serif text-3xl text-white md:text-4xl'>
                        Pay over time,{' '}
                        <span className='text-gold-400 italic'>
                            if you choose
                        </span>
                    </h2>

                    <p className='text-lg leading-relaxed text-stone-300'>
                        {FINANCING_SENTENCE_LONG}
                    </p>
                </div>

                {/* The lenders, named; no figure */}
                <ul
                    aria-label='Financing partners'
                    className='mx-auto grid max-w-3xl gap-4 sm:grid-cols-3'
                >
                    {FINANCING_PARTNERS.map((partner) => (
                        <li
                            key={partner}
                            className='rounded-xl border border-white/10 bg-white/5 p-6 text-center font-serif text-2xl text-white backdrop-blur-sm'
                        >
                            {partner}
                        </li>
                    ))}
                </ul>

                <div className='mt-12 flex flex-wrap items-center justify-center gap-6 text-stone-300'>
                    <div className='flex items-center gap-2'>
                        <Languages className='text-gold-400 h-5 w-5' />
                        <span lang='es'>Hablamos español</span>
                    </div>
                    <a
                        href={FINANCING_PAGE_PATH}
                        className='text-gold-400 underline decoration-white/30 underline-offset-4 hover:text-white'
                    >
                        How financing works
                    </a>
                </div>

                <div className='mt-10 text-center'>
                    <a
                        href={formAnchor}
                        className='bg-gold-400 hover:bg-gold-300 inline-flex items-center gap-2 rounded-full px-8 py-4 font-semibold text-stone-950 shadow-lg transition-colors'
                    >
                        Ask about financing
                        <span aria-hidden='true'>↑</span>
                    </a>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}

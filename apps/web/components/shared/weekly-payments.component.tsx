/**
 * WeeklyPayments Component
 *
 * Displays weekly payment options for popular procedures, emphasizing
 * that premium results come with flexible financing options.
 *
 * Key conversion strategy: Position financing as "smart investment"
 * rather than "cheap/discount" - maintaining luxury brand positioning
 * while showing accessibility.
 *
 * Used on both specials and contact pages.
 */
import { CreditCard, Check, Languages } from 'lucide-react'

import { SectionContainer } from '@/components/shared/section-container.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { WEEKLY_PAYMENT_OPTIONS as PAYMENT_OPTIONS } from '@/lib/data/weekly-payments.data'

export type WeeklyPaymentsProps = {
    readonly id?: string
    /** Anchor link for the form CTA (default: #contact-form) */
    readonly formAnchor?: string
}

export function WeeklyPayments({
    id = 'weekly-payments',
    formAnchor = '#contact-form',
}: WeeklyPaymentsProps) {
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
                {/* Section Header */}
                <div className='mx-auto mb-12 max-w-2xl text-center lg:mb-16'>
                    <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2'>
                        <CreditCard className='text-gold-400 h-4 w-4' />
                        <span className='text-gold-400 text-sm font-medium'>
                            Smart Financing Options
                        </span>
                    </div>

                    <h2 className='mb-4 font-serif text-3xl text-white md:text-4xl'>
                        Your Investment,{' '}
                        <span className='text-gold-400 italic'>Your Terms</span>
                    </h2>

                    <p className='text-lg leading-relaxed text-stone-300'>
                        Same board-certified surgeons. Same luxury experience.
                        Flexible financing that works for your life.
                    </p>
                </div>

                {/* Payment Grid */}
                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                    {PAYMENT_OPTIONS.map((option) => (
                        <div
                            key={option.procedure}
                            className='group relative rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10'
                        >
                            {/* Highlight Badge */}
                            {option.highlight && (
                                <div className='bg-gold-500 absolute -top-3 right-4 rounded-full px-3 py-1 text-xs font-bold text-white'>
                                    {option.highlight}
                                </div>
                            )}

                            {/* Procedure Name */}
                            <h3 className='mb-4 font-medium text-white'>
                                {option.procedure}
                            </h3>

                            {/* Weekly Payment */}
                            <div className='flex items-baseline gap-1'>
                                <span className='text-gold-400 font-serif text-3xl font-bold'>
                                    ${option.weeklyPayment}
                                </span>
                                <span className='text-stone-400'>/week</span>
                            </div>

                            {/* Credit Notice */}
                            <p className='mt-2 text-sm text-stone-500'>
                                With approved credit
                            </p>
                        </div>
                    ))}
                </div>

                {/* Financing Benefits */}
                <div className='mt-12 flex flex-wrap items-center justify-center gap-6 text-stone-300'>
                    <div className='flex items-center gap-2'>
                        <Languages className='text-gold-400 h-5 w-5' />
                        <span>Hablamos Español</span>
                    </div>
                    <div className='flex items-center gap-2'>
                        <Check className='text-gold-400 h-5 w-5' />
                        <span>0% APR Available</span>
                    </div>
                    <div className='flex items-center gap-2'>
                        <Check className='text-gold-400 h-5 w-5' />
                        <span>Quick Approval</span>
                    </div>
                    <div className='flex items-center gap-2'>
                        <Check className='text-gold-400 h-5 w-5' />
                        <span>No Hidden Fees</span>
                    </div>
                </div>

                {/* Disclaimer */}
                <p className='mt-8 text-center text-xs leading-relaxed text-stone-500'>
                    *Prices shown are starting weekly payments and may vary
                    based on procedure complexity, individual treatment plans,
                    and financing terms. Final pricing will be provided during
                    your personalized consultation. Subject to credit approval.
                </p>

                {/* CTA */}
                <div className='mt-10 text-center'>
                    <a
                        href={formAnchor}
                        className='bg-gold-500 hover:bg-gold-600 inline-flex items-center gap-2 rounded-lg px-8 py-4 font-semibold text-white shadow-lg transition-colors'
                    >
                        See Your Custom Plan
                        <span aria-hidden='true'>↑</span>
                    </a>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}

/**
 * InlineCtaBand Component
 *
 * Mid-page lead capture, positioned immediately after the proof sections
 * (results gallery + Google reviews).
 *
 * Conversion rationale: trust peaks right after a visitor has seen real
 * results and read real reviews. That is the moment to ask again — not
 * eight sections later at the bottom of the page. This band carries the
 * same compact form as the hero so a convinced visitor never has to scroll
 * back up or navigate away.
 */
'use client'

import { CheckCircle2 } from 'lucide-react'

import { ConsultationForm } from '@/components/shared/forms/consultation-form.component'
import { CONTACT_SOURCES } from '@/lib/types/forms/contact-form.type'
import { siteConfig } from '@/lib/data/site-config'

/** What the visitor actually gets — stated plainly, no marketing verbs. */
const WHAT_YOU_GET = [
    'A straight answer on whether you’re a candidate',
    'Your all-inclusive price — in writing, no surprise fees',
    'Financing options and your real monthly payment',
    'Time with a surgeon, not a commission-paid closer',
] as const

export const InlineCtaBand = () => {
    return (
        <section
            id='book-consultation'
            className='relative overflow-hidden bg-stone-900 py-20 md:py-28'
            aria-labelledby='inline-cta-heading'
        >
            {/* Background art */}
            <div
                className='pointer-events-none absolute inset-0 overflow-hidden'
                aria-hidden='true'
            >
                <div className='bg-gold-600/10 absolute -top-[30%] -right-[5%] h-[600px] w-[600px] rounded-full blur-3xl' />
                <div className='absolute -bottom-[30%] -left-[10%] h-[500px] w-[500px] rounded-full bg-stone-700/25 blur-3xl' />
            </div>

            <div className='relative z-10 container mx-auto px-6 md:px-12'>
                <div className='grid items-center gap-12 lg:grid-cols-2 lg:gap-20'>
                    {/* Left — the offer */}
                    <div>
                        <span className='text-gold-400 mb-4 block text-xs font-bold tracking-[0.25em] uppercase'>
                            No Cost. No Obligation.
                        </span>

                        <h2
                            id='inline-cta-heading'
                            className='mb-6 font-serif text-4xl leading-tight text-white md:text-5xl'
                        >
                            Find out what your
                            <span className='text-stone-400 italic'>
                                {' '}
                                procedure actually costs.
                            </span>
                        </h2>

                        <p className='mb-8 max-w-md text-lg leading-relaxed text-stone-300'>
                            Most people spend years guessing. One free
                            consultation replaces the guessing with a number, a
                            plan, and a date.
                        </p>

                        <ul className='space-y-4'>
                            {WHAT_YOU_GET.map((item) => (
                                <li
                                    key={item}
                                    className='flex items-start gap-3 text-stone-200'
                                >
                                    <CheckCircle2
                                        className='text-gold-500 mt-0.5 h-5 w-5 shrink-0'
                                        aria-hidden='true'
                                    />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>

                        <p className='mt-8 border-t border-white/10 pt-6 text-sm text-stone-400'>
                            Consultations available in English and Spanish ·{' '}
                            <span className='text-stone-200'>
                                Hablamos Español
                            </span>
                            {' · '}
                            {siteConfig.contact.city},{' '}
                            {siteConfig.contact.state} &amp; virtual
                        </p>
                    </div>

                    {/* Right — the form */}
                    <div className='rounded-sm border border-white/10 bg-white/5 p-7 shadow-2xl backdrop-blur-lg md:p-10'>
                        <ConsultationForm
                            title='Request Your Free Consultation'
                            subtitle='Takes under a minute. We call within 24 hours.'
                            source={CONTACT_SOURCES.LEAD_FORM}
                            analyticsFormName='home_inline_cta_form'
                            enableAnalytics
                            compact
                            submitText='Get My Free Consultation'
                            footerNote='Private & confidential. Your information is never shared.'
                            redirectOnSuccess='/thank-you'
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}

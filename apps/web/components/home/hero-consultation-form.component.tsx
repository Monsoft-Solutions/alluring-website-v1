/**
 * HeroConsultationForm Component
 *
 * The primary lead-capture form, rendered inside the homepage hero card.
 *
 * Conversion rationale: the homepage previously pushed visitors to
 * /contact-us and kept its only form below twelve sections. Capturing
 * first name + phone + procedure in the hero removes that navigation
 * step entirely — the three fields below are the minimum a consultation
 * coordinator needs to call someone back.
 *
 * Uses the shared ConsultationForm in `compact` mode (first name, phone,
 * procedure, single-line consent) with the dark field variant, which sits
 * on the hero's smoked-glass card.
 */
'use client'

import { ShieldCheck } from 'lucide-react'

import { ConsultationForm } from '@/components/shared/forms/consultation-form.component'
import { CONTACT_SOURCES } from '@/lib/types/forms/contact-form.type'

export const HeroConsultationForm = () => {
    return (
        <div className='relative'>
            {/* Card glow — separates the form from the video behind it */}
            <div
                className='bg-gold-500/20 pointer-events-none absolute -inset-4 rounded-[2rem] blur-3xl'
                aria-hidden='true'
            />

            <div className='relative overflow-hidden rounded-sm border border-white/15 bg-stone-900/85 p-7 shadow-2xl backdrop-blur-2xl md:p-9'>
                {/* Gold hairline along the top edge */}
                <div
                    className='via-gold-400/70 absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent'
                    aria-hidden='true'
                />

                <ConsultationForm
                    title='See If You Qualify'
                    subtitle='Free consultation • No obligation • Hablamos Español'
                    source={CONTACT_SOURCES.CONTACT_HERO}
                    analyticsFormName='home_hero_form'
                    enableAnalytics
                    compact
                    submitText='Get My Free Consultation'
                    footerNote='We call within 24 hours. Your information is never shared.'
                    redirectOnSuccess='/thank-you'
                />

                {/* Reassurance strip — answers "what happens after I submit?" */}
                <div className='mt-6 flex items-center justify-center gap-2 border-t border-white/10 pt-5 text-center text-xs text-stone-400'>
                    <ShieldCheck
                        className='text-gold-500 h-4 w-4 shrink-0'
                        aria-hidden='true'
                    />
                    <span>
                        Private &amp; confidential. A patient coordinator calls
                        you — never a sales team.
                    </span>
                </div>
            </div>
        </div>
    )
}

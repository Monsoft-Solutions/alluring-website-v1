/**
 * Atelier Hero Form
 *
 * The shared ConsultationForm is hardcoded to a dark theme, so rather than
 * fight it this direction gives it a bark-brown card that belongs in the
 * palette. Warm dark against shell reads as intentional; a grey-black card
 * would not.
 *
 * Compact field set — first name, phone, procedure. "Start a conversation"
 * rather than "Get My Free Quote": the ask has to match the register of
 * the page or the whole direction stops being credible.
 */
'use client'

import { ConsultationForm } from '@/components/shared/forms/consultation-form.component'
import { CONTACT_SOURCES } from '@/lib/types/forms/contact-form.type'

export function AtelierHeroForm() {
    return (
        <div className='rounded-[2rem] bg-[#2A1D17] p-7 shadow-xl md:p-9'>
            <ConsultationForm
                title='Start a conversation'
                subtitle='Free · No obligation · Hablamos Español'
                source={CONTACT_SOURCES.CONTACT_HERO}
                analyticsFormName='home_atelier_hero_form'
                enableAnalytics
                compact
                submitText='Start a conversation'
                footerNote='We call within 24 hours. Nothing is booked and no deposit is taken.'
                redirectOnSuccess='/thank-you'
            />
        </div>
    )
}

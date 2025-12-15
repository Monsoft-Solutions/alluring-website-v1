/**
 * LeadForm Component
 *
 * Consultation request form for the home page.
 * Uses the shared ConsultationForm component.
 *
 * Features:
 * - Full consultation form with all fields
 * - Elegant dark theme with gold accents
 * - Background decorative elements
 */
'use client'

import { ConsultationForm } from '@/components/shared/forms/consultation-form.component'
import { CONTACT_SOURCES } from '@/lib/types/forms/contact-form.type'

export const LeadForm = () => {
    return (
        <section className='relative overflow-hidden bg-stone-900 py-24'>
            {/* Background Art */}
            <div className='pointer-events-none absolute inset-0 overflow-hidden'>
                <div className='bg-gold-600/10 absolute -top-[20%] -right-[10%] h-[600px] w-[600px] rounded-full blur-3xl' />
                <div className='absolute -bottom-[20%] -left-[10%] h-[500px] w-[500px] rounded-full bg-stone-700/20 blur-3xl' />
            </div>

            <div className='relative z-10 container mx-auto px-6 md:px-12'>
                <div className='mx-auto max-w-4xl rounded-sm border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-lg md:p-16'>
                    <ConsultationForm
                        title='Request Your Consultation'
                        subtitle='Tell us a bit about your goals. Our concierge will reach out to discuss availability.'
                        source={CONTACT_SOURCES.LEAD_FORM}
                        analyticsFormName='lead_form'
                        enableAnalytics
                        redirectOnSuccess='/thank-you'
                    />
                </div>
            </div>
        </section>
    )
}

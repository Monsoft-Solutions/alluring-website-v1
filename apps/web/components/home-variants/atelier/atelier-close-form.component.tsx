/**
 * Atelier Close Form
 *
 * Distinct `source` and `analyticsFormName` from the hero form so
 * hero-versus-close performance stays separable in reporting.
 */
'use client'

import { ConsultationForm } from '@/components/shared/forms/consultation-form.component'
import { CONTACT_SOURCES } from '@/lib/types/forms/contact-form.type'

export function AtelierCloseForm() {
    return (
        <div className='rounded-[2rem] bg-[#2A1D17] p-7 shadow-xl md:p-10'>
            <ConsultationForm
                title='Ask your question'
                subtitle='Free · No obligation · Hablamos Español'
                source={CONTACT_SOURCES.LEAD_FORM}
                analyticsFormName='home_atelier_close_form'
                enableAnalytics
                compact
                submitText='Send my question'
                footerNote='We call within 24 hours. Nothing is booked and no deposit is taken.'
                redirectOnSuccess='/thank-you'
            />
        </div>
    )
}

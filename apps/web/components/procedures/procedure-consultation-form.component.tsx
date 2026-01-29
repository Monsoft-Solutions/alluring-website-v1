/**
 * ProcedureConsultationForm Component
 *
 * A consultation form wrapper designed for procedure pages.
 * Pre-populates the procedure dropdown and includes trust indicators.
 *
 * Features:
 * - Dark background section styling
 * - Procedure-specific title
 * - Trust indicators (Board-Certified, Patient count, 24hr Response)
 * - Testimonial quote for social proof
 * - Pre-populated procedure field
 */
'use client'

import { Award, Clock, Users } from 'lucide-react'

import { ConsultationForm } from '@/components/shared/forms/consultation-form.component'
import { siteConfig } from '@/lib/data/site-config'
import {
    CONTACT_SOURCES,
    getProcedureFormValue,
} from '@/lib/types/forms/contact-form.type'

export type ProcedureConsultationFormProps = {
    /** The procedure slug (e.g., 'breast-augmentation-miami') */
    readonly procedureSlug: string
    /** The procedure display title (e.g., 'Breast Augmentation') */
    readonly procedureTitle: string
}

const TRUST_INDICATORS = [
    {
        icon: Award,
        label: 'Board-Certified Surgeons',
    },
    {
        icon: Users,
        label: `${siteConfig.trustStats?.patients ?? '5,000+'} Happy Patients`,
    },
    {
        icon: Clock,
        label: '24hr Response Time',
    },
] as const

export function ProcedureConsultationForm({
    procedureSlug,
    procedureTitle,
}: ProcedureConsultationFormProps) {
    const defaultProcedure = getProcedureFormValue(procedureSlug)

    return (
        <section className='relative overflow-hidden bg-stone-900 py-24'>
            {/* Background Art */}
            <div className='pointer-events-none absolute inset-0 overflow-hidden'>
                <div className='bg-gold-600/10 absolute -top-[20%] -right-[10%] h-[600px] w-[600px] rounded-full blur-3xl' />
                <div className='absolute -bottom-[20%] -left-[10%] h-[500px] w-[500px] rounded-full bg-stone-700/20 blur-3xl' />
            </div>

            <div className='relative z-10 container mx-auto px-6 md:px-12'>
                {/* Trust Indicators */}
                <div className='mx-auto mb-12 flex max-w-3xl flex-wrap justify-center gap-6 md:gap-10'>
                    {TRUST_INDICATORS.map((indicator) => (
                        <div
                            key={indicator.label}
                            className='flex items-center gap-2 text-stone-400'
                        >
                            <indicator.icon className='text-gold-500 h-5 w-5' />
                            <span className='text-sm font-medium'>
                                {indicator.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Form Container */}
                <div className='mx-auto max-w-4xl rounded-sm border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-lg md:p-16'>
                    <ConsultationForm
                        title={`Ready to Start Your ${procedureTitle} Journey?`}
                        subtitle='Complimentary Consultation • Hablamos Español'
                        source={CONTACT_SOURCES.PROCEDURE_PAGE}
                        analyticsFormName={`procedure_${procedureSlug}_form`}
                        enableAnalytics
                        redirectOnSuccess='/thank-you'
                        defaultProcedure={defaultProcedure}
                    />
                </div>

                {/* Testimonial Quote */}
                <div className='mx-auto mt-12 max-w-2xl text-center'>
                    <blockquote className='text-stone-400 italic'>
                        &ldquo;The entire experience exceeded my expectations.
                        From the first consultation to my final follow-up, I
                        felt cared for every step of the way.&rdquo;
                    </blockquote>
                    <p className='text-gold-500 mt-3 text-sm font-medium'>
                        — Verified Patient
                    </p>
                </div>
            </div>
        </section>
    )
}

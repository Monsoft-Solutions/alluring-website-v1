import { cn } from '@workspace/ui/lib/utils'

import { ConsultationForm } from '@/components/shared/forms/consultation-form.component'
import {
    CONTACT_SOURCES,
    getProcedureFormValue,
} from '@/lib/types/forms/contact-form.type'

import { bblContainer } from './bbl-ui.constant'

/**
 * A two-field consultation request, right after the results: the point where
 * a reader has just seen real outcomes, 18,000 px above the full form on a
 * phone.
 *
 * The shared `ConsultationForm` in its compact mode (first name and phone),
 * the one the home hero and the paid landing page use, so the lead reaches
 * `/api/contact` like every other. Its own analytics name tells its leads
 * apart from the full form's, so the lift can be measured.
 */
export function BblQuickQuote({
    procedureSlug,
    className,
}: {
    procedureSlug: string
    className?: string
}) {
    return (
        <div className='bg-stone-50'>
            <section
                id='quick-quote'
                aria-labelledby='quick-quote-heading'
                className={cn(bblContainer, 'pb-12 md:pb-24', className)}
            >
                <div className='border-t-gold-400 grid gap-8 border-t-[3px] bg-stone-900 px-5 py-8 sm:px-9 sm:py-10 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-center lg:gap-16 lg:px-12 lg:py-12'>
                    <div>
                        <h2
                            id='quick-quote-heading'
                            className='font-serif text-[1.75rem] leading-[1.2] font-medium text-balance text-stone-50 md:text-[2.125rem] md:leading-[1.15]'
                        >
                            Get your personal BBL plan and price
                        </h2>
                        <p className='mt-3 max-w-[34rem] text-[1.0625rem] leading-[1.6] text-stone-300'>
                            Leave your first name and number, and a patient
                            coordinator contacts you to set up your free
                            consultation.
                        </p>
                        <p className='mt-3 text-[0.9375rem] text-stone-400'>
                            Complimentary and confidential.{' '}
                            <span lang='es'>Hablamos español.</span>
                        </p>
                    </div>
                    <div data-copy-check='data'>
                        <ConsultationForm
                            compact
                            showProcedureBadge={false}
                            title=''
                            subtitle=''
                            source={CONTACT_SOURCES.PROCEDURE_PAGE}
                            analyticsFormName={`procedure_${procedureSlug}_results_form`}
                            enableAnalytics
                            redirectOnSuccess='/thank-you'
                            defaultProcedure={getProcedureFormValue(
                                procedureSlug
                            )}
                            submitText='Get my free consultation'
                        />
                    </div>
                </div>
            </section>
        </div>
    )
}

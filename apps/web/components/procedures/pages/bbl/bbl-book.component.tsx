import { Phone } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'

import { ConsultationForm } from '@/components/shared/forms/consultation-form.component'
import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'
import { getPhoneLink, siteConfig } from '@/lib/data/site-config'
import {
    CONTACT_SOURCES,
    getProcedureFormValue,
} from '@/lib/types/forms/contact-form.type'

import { bblButtonSecondary, bblContainer } from './bbl-ui.constant'

const nextSteps = [
    'A patient coordinator contacts you to find a consultation time.',
    'Your surgeon examines you, recommends a plan and confirms your price.',
    'If you go ahead, your dates are confirmed in writing.',
]

/**
 * "How do I book a BBL consultation in Miami?" The answer and the three
 * steps beside the site's consultation form.
 *
 * The form is the shared `ConsultationForm` with the same source, analytics
 * name and redirect the template's procedure form sends, so leads from this
 * page land and report exactly as before. It is built for dark backgrounds,
 * hence the stone-900 card. `bbl-book` names the view timeline the mobile
 * bar uses to step aside while the form is on screen.
 */
export function BblBook({ procedureSlug }: { procedureSlug: string }) {
    return (
        <div className='bbl-book bg-white'>
            <AnswerBlock
                id='book'
                question='How do I book a BBL consultation in Miami?'
                className={cn(
                    bblContainer,
                    'grid grid-cols-[minmax(0,1fr)] py-12 md:py-24 lg:grid-cols-[minmax(0,32.5rem)_minmax(0,35rem)] lg:grid-rows-[auto_auto_1fr] lg:justify-between lg:gap-x-16 lg:[&>h2]:col-start-1 lg:[&>p]:col-start-1'
                )}
                answer='Send the form below or call us. A patient coordinator contacts you to set a time, and at the consultation your surgeon examines you, talks through your goals, recommends a type of BBL and confirms your price. If you go ahead, your surgery, pre-op and follow-up dates are confirmed in writing.'
            >
                <div className='lg:col-start-1'>
                    <ol
                        aria-label='What happens after you send the form'
                        className='mt-8 flex flex-col gap-4.5'
                    >
                        {nextSteps.map((step, index) => (
                            <li
                                key={step}
                                className='grid grid-cols-[2.5rem_minmax(0,1fr)] items-start gap-x-4'
                            >
                                <span
                                    aria-hidden='true'
                                    className='border-gold-500 flex size-10 items-center justify-center rounded-full border font-serif text-lg text-stone-900'
                                >
                                    {index + 1}
                                </span>
                                <p className='pt-2 text-[1.0625rem] leading-[1.55] text-stone-900'>
                                    {step}
                                </p>
                            </li>
                        ))}
                    </ol>
                    <a
                        href={getPhoneLink()}
                        data-copy-check='data'
                        className={cn(bblButtonSecondary, 'mt-8 tabular-nums')}
                    >
                        <Phone aria-hidden='true' className='size-[1.125rem]' />
                        Call {siteConfig.contact.phoneDisplay}
                    </a>
                </div>

                <div
                    data-copy-check='data'
                    className='border-t-gold-400 mt-10 border-t-[3px] bg-stone-900 px-5 py-8 sm:px-9 sm:py-10 lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:mt-0 lg:self-start'
                >
                    <h3 className='font-serif text-[1.625rem] leading-[1.25] font-medium text-stone-50'>
                        Request your free consultation
                    </h3>
                    <p className='mt-2 text-[0.9375rem] text-stone-400'>
                        Complimentary and confidential. Hablamos español.
                    </p>
                    <ConsultationForm
                        title=''
                        subtitle=''
                        source={CONTACT_SOURCES.PROCEDURE_PAGE}
                        analyticsFormName={`procedure_${procedureSlug}_form`}
                        enableAnalytics
                        redirectOnSuccess='/thank-you'
                        defaultProcedure={getProcedureFormValue(procedureSlug)}
                        className='mt-7'
                    />
                </div>
            </AnswerBlock>
        </div>
    )
}

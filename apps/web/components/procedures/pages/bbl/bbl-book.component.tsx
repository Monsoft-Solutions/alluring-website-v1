import Link from 'next/link'
import { MapPin, Phone } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'

import { ConsultationForm } from '@/components/shared/forms/consultation-form.component'
import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'
import {
    getFullAddress,
    getPhoneLink,
    siteConfig,
} from '@/lib/data/site-config'
import {
    CONTACT_SOURCES,
    getProcedureFormValue,
} from '@/lib/types/forms/contact-form.type'
import type { BusinessHours } from '@/lib/types/site-config.type'

import {
    bblButtonSecondary,
    bblContainer,
    bblH3,
    bblLink,
} from './bbl-ui.constant'

const { contact } = siteConfig

/** "Monday - Friday" as the page sets a range: "Monday–Friday". */
const hoursLine = ({ days, open, close }: BusinessHours) =>
    open === 'Closed'
        ? `${days.replace(' - ', '–')}: closed`
        : `${days.replace(' - ', '–')}: ${open}–${close}`

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
 * bar uses to step aside while the form is on screen. The optional contact
 * time field is off: one less field between the reader and sending.
 *
 * The body copy never said where the clinic is, so the address, the hours and
 * a directions link sit beside the form, read from `siteConfig`.
 */
export function BblBook({ procedureSlug }: { procedureSlug: string }) {
    return (
        <div className='bbl-book bg-white'>
            <AnswerBlock
                id='book'
                question='How do I book a BBL consultation in Miami?'
                className={cn(
                    bblContainer,
                    'grid grid-cols-[minmax(0,1fr)] py-12 md:py-24 lg:grid-cols-[minmax(0,32.5rem)_minmax(0,35rem)] lg:grid-rows-[auto_auto_auto_1fr] lg:justify-between lg:gap-x-16 lg:[&>h2]:col-start-1 lg:[&>p]:col-start-1'
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
                    className='border-t-gold-400 mt-10 border-t-[3px] bg-stone-900 px-5 py-8 sm:px-9 sm:py-10 lg:col-start-2 lg:row-span-4 lg:row-start-1 lg:mt-0 lg:self-start'
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
                        showPreferredContactTime={false}
                        className='mt-7'
                    />
                </div>

                {/* After the form in the markup, so a phone reaches the form
                    first; the grid puts it back under the steps from `lg`. */}
                <div className='mt-10 border-t border-stone-200 pt-7 lg:col-start-1 lg:row-start-4'>
                    <h3 className={bblH3}>Where you&apos;ll be seen</h3>
                    <div
                        data-copy-check='data'
                        className='mt-3.5 flex gap-3 text-[1.0625rem] leading-[1.6] text-stone-700 tabular-nums'
                    >
                        <MapPin
                            aria-hidden='true'
                            className='text-gold-600 mt-1 size-5 shrink-0'
                        />
                        <div>
                            <address className='not-italic'>
                                {siteConfig.business.name}
                                <br />
                                {contact.address}
                                <br />
                                {contact.city}, {contact.state}{' '}
                                {contact.postalCode}
                            </address>
                            <ul className='mt-2 text-base text-stone-600'>
                                {contact.businessHours?.map((hours) => (
                                    <li key={hours.days}>{hoursLine(hours)}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <ul className='mt-4 flex flex-col items-start gap-1 pl-8'>
                        <li>
                            <a
                                href={`https://maps.google.com/?q=${encodeURIComponent(getFullAddress())}`}
                                target='_blank'
                                rel='noopener noreferrer'
                                className={cn(
                                    bblLink,
                                    'inline-flex min-h-11 items-center text-base font-bold'
                                )}
                            >
                                Get directions
                            </a>
                        </li>
                        <li>
                            <Link
                                href='/fly-in-consultation'
                                className={cn(
                                    bblLink,
                                    'inline-flex min-h-11 items-center text-base'
                                )}
                            >
                                Live in another state? Start with a virtual
                                consultation
                            </Link>
                        </li>
                    </ul>
                </div>
            </AnswerBlock>
        </div>
    )
}

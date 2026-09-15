/**
 * ProcedurePricing Component
 *
 * The published price table for a procedure page. Cost is the single highest
 * intent a procedure query carries ("bbl cost miami", "brazilian butt lift
 * cost"), and before this section the answer lived only in a paragraph buried
 * two thirds of the way down the markdown body — below the gallery, the
 * reviews and the lead form. Google was quoting blog posts for it instead.
 *
 * Server-rendered with CSS animations: this is marketing content that has to
 * be in the HTML Google receives.
 *
 * The figures come from `procedure.pricing` so the visible table and the
 * `Offer` in JSON-LD are driven by the same numbers.
 */
import { Check } from 'lucide-react'

import { ContainerLayout } from '@/components/container-layout.component'
import { WEEKLY_PAYMENT_DISCLAIMER } from '@/lib/data/weekly-payments.data'
import type { ProcedurePricing } from '@/lib/types/procedure.type'

/** Formats a USD figure the way the rest of the site writes prices: `$3,500`. */
export function formatProcedurePrice(amount: number): string {
    return `$${amount.toLocaleString('en-US')}`
}

/**
 * Strips the trailing location from a procedure title so it can be dropped
 * into a sentence that supplies its own.
 *
 * Procedure titles are stored location-qualified ("Brazilian Butt Lift (BBL)
 * Miami") because that is how they read as a page heading. Interpolated into
 * "How much does a ... cost in Miami?" they say Miami twice.
 */
function toProcedureNoun(title: string): string {
    return title.replace(/[\s,]*\bMiami\b[\s,]*$/i, '').trim() || title
}

interface ProcedurePricingProps {
    procedureTitle: string
    pricing: ProcedurePricing
    /** Anchor target, so copy elsewhere on the page can link to the table. */
    id?: string
}

export function ProcedurePricing({
    procedureTitle,
    pricing,
    id = 'pricing',
}: ProcedurePricingProps) {
    const { startingAt, upTo, weeklyFrom, includes, factors } = pricing

    const headingId = `${id}-heading`
    const noun = toProcedureNoun(procedureTitle)
    const range = upTo
        ? `${formatProcedurePrice(startingAt)} – ${formatProcedurePrice(upTo)}`
        : `From ${formatProcedurePrice(startingAt)}`

    // Built as one string so JSX line breaks cannot introduce a stray space
    // before the comma.
    const summary = upTo
        ? `A ${noun} at Alluring Plastic Surgery starts at ${formatProcedurePrice(startingAt)}, with most patients paying between ${formatProcedurePrice(startingAt)} and ${formatProcedurePrice(upTo)}. Every price is personalized to your body and your goals.`
        : `A ${noun} at Alluring Plastic Surgery starts at ${formatProcedurePrice(startingAt)}. Every price is personalized to your body and your goals.`

    return (
        <section
            id={id}
            aria-labelledby={headingId}
            className='scroll-mt-24 bg-white py-16 lg:py-24'
        >
            <ContainerLayout>
                <div className='mx-auto max-w-3xl'>
                    <div className='animate-fade-in-up mb-10 text-center'>
                        <h2
                            id={headingId}
                            className='font-serif text-3xl font-medium text-stone-900 sm:text-4xl'
                        >
                            How Much Does a {noun} Cost in Miami?
                        </h2>
                        <p className='mt-4 text-lg font-light text-stone-600'>
                            {summary}
                        </p>
                    </div>

                    {/* Headline figures */}
                    <dl className='animate-fade-in-up animate-delay-100 grid gap-px overflow-hidden rounded-2xl bg-stone-200 sm:grid-cols-3'>
                        <div className='bg-stone-50 p-6 text-center'>
                            <dt className='text-xs font-bold tracking-[0.2em] text-stone-500 uppercase'>
                                Starting at
                            </dt>
                            <dd className='text-gold-600 mt-2 font-serif text-3xl font-medium'>
                                {formatProcedurePrice(startingAt)}
                            </dd>
                        </div>
                        <div className='bg-stone-50 p-6 text-center'>
                            <dt className='text-xs font-bold tracking-[0.2em] text-stone-500 uppercase'>
                                Typical range
                            </dt>
                            <dd className='mt-2 font-serif text-2xl font-medium tracking-tight text-stone-900'>
                                {range}
                            </dd>
                        </div>
                        {weeklyFrom !== undefined ? (
                            <div className='bg-stone-50 p-6 text-center'>
                                <dt className='text-xs font-bold tracking-[0.2em] text-stone-500 uppercase'>
                                    Financing from
                                </dt>
                                <dd className='mt-2 font-serif text-3xl font-medium text-stone-900'>
                                    ${weeklyFrom}
                                    <span className='text-lg text-stone-500'>
                                        /week
                                    </span>
                                </dd>
                            </div>
                        ) : (
                            <div className='bg-stone-50 p-6 text-center'>
                                <dt className='text-xs font-bold tracking-[0.2em] text-stone-500 uppercase'>
                                    Financing
                                </dt>
                                <dd className='mt-2 font-serif text-2xl font-medium tracking-tight text-stone-900'>
                                    Available
                                </dd>
                            </div>
                        )}
                    </dl>

                    {/* What the price covers */}
                    {includes.length > 0 && (
                        <div className='animate-fade-in-up animate-delay-200 mt-12'>
                            <h3 className='font-serif text-2xl font-medium text-stone-900'>
                                What Your Price Includes
                            </h3>
                            <ul className='mt-6 grid gap-3 sm:grid-cols-2'>
                                {includes.map((item) => (
                                    <li
                                        key={item}
                                        className='flex items-start gap-3'
                                    >
                                        <Check
                                            className='text-gold-600 mt-1 h-4 w-4 shrink-0'
                                            strokeWidth={2.5}
                                            aria-hidden='true'
                                        />
                                        <span className='font-light text-stone-700'>
                                            {item}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* What moves the price */}
                    {factors.length > 0 && (
                        <div className='animate-fade-in-up animate-delay-300 mt-12'>
                            <h3 className='font-serif text-2xl font-medium text-stone-900'>
                                What Changes the Price
                            </h3>
                            <dl className='mt-6 space-y-5'>
                                {factors.map((factor) => (
                                    <div key={factor.label}>
                                        <dt className='font-medium text-stone-900'>
                                            {factor.label}
                                        </dt>
                                        <dd className='mt-1 font-light text-stone-600'>
                                            {factor.description}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    )}

                    <p className='mt-10 border-t border-stone-200 pt-6 text-sm font-light text-stone-500'>
                        {weeklyFrom !== undefined
                            ? WEEKLY_PAYMENT_DISCLAIMER
                            : 'Prices are a guide, not a quote. Every price is personalized, and ranges are estimates that may change. Your surgeon gives you an exact all-inclusive price in consultation. Financing is subject to credit approval.'}
                    </p>
                </div>
            </ContainerLayout>
        </section>
    )
}

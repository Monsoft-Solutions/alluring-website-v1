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
 * The figures come from the pricing resolver (`prices`, #354), the same
 * object the `Offer` in JSON-LD reads, so the two can't disagree; a discount
 * shows the list price struck through, with the 456.062 statement under the
 * figures. `procedure.pricing` supplies what the price covers and what moves
 * it. No financing figure: financing is named, never quoted (canon D6).
 */
import { Check } from 'lucide-react'

import { ContainerLayout } from '@/components/container-layout.component'
import { DiscountStatement } from '@/components/shared/discount-statement.component'
import {
    PriceRangeFigures,
    PriceRangeText,
    PriceTag,
} from '@/components/shared/price-tag.component'
import type { ProcedurePrices } from '@/lib/claims/procedure-prices.util'
import { FINANCING_SENTENCE_SHORT } from '@workspace/shared/claims/financing'
import {
    formatLineName,
    quotesAsNamedLine,
    withIndefiniteArticle,
} from '@workspace/shared/claims/pricing'
import type { ProcedurePricing as ProcedurePricingData } from '@/lib/types/procedure.type'

/**
 * Strips the trailing location from a procedure title so it can be dropped
 * into a sentence that supplies its own.
 *
 * Procedure titles are stored location-qualified ("Brazilian Butt Lift (BBL)
 * Miami") because that is how they read as a page heading. Interpolated into
 * "How much does ... cost in Miami?" they say Miami twice.
 */
function toProcedureNoun(title: string): string {
    return title.replace(/[\s,]*\bMiami\b[\s,]*$/i, '').trim() || title
}

interface ProcedurePricingProps {
    procedureTitle: string
    pricing: ProcedurePricingData
    /** The procedure's resolved prices (`getProcedurePrices`). */
    prices: ProcedurePrices
    /** Anchor target, so copy elsewhere on the page can link to the table. */
    id?: string
}

export function ProcedurePricing({
    procedureTitle,
    pricing,
    prices,
    id = 'pricing',
}: ProcedurePricingProps) {
    const { includes, factors } = pricing
    const { starting, range } = prices

    // Nothing to publish: a procedure with no starting line prints no price
    // section rather than a typed figure.
    if (!starting) return null

    const headingId = `${id}-heading`
    const noun = toProcedureNoun(procedureTitle)
    // The starting line is named, so the figure stays true when the admin
    // picks another line; a named-line procedure (the facelift, D2) is never
    // "starting at" (canon §5).
    const lineName = formatLineName(starting.label)
    const namedOnly = quotesAsNamedLine(starting.procedure)

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
                            {namedOnly ? (
                                <>
                                    At Alluring Plastic Surgery,{' '}
                                    {withIndefiniteArticle(lineName)} is{' '}
                                    <PriceTag price={starting} />
                                </>
                            ) : (
                                <>
                                    A {noun} at Alluring Plastic Surgery starts
                                    at <PriceTag price={starting} /> for{' '}
                                    {withIndefiniteArticle(lineName)}
                                </>
                            )}
                            {range && (
                                <>
                                    , and <PriceRangeText range={range} />
                                </>
                            )}
                            . Every price is personalized to your body and your
                            goals.
                        </p>
                    </div>

                    {/* Headline figures */}
                    <dl className='animate-fade-in-up animate-delay-100 grid gap-px overflow-hidden rounded-2xl bg-stone-200 sm:grid-cols-3'>
                        <div className='bg-stone-50 p-6 text-center'>
                            <dt className='text-xs font-bold tracking-[0.2em] text-stone-500 uppercase'>
                                {namedOnly
                                    ? formatLineName(starting.label, {
                                          short: true,
                                          capitalized: true,
                                      })
                                    : 'Starting at'}
                            </dt>
                            <dd className='text-gold-600 mt-2 font-serif text-3xl font-medium'>
                                <PriceTag price={starting} />
                            </dd>
                        </div>
                        {range && (
                            <div className='bg-stone-50 p-6 text-center'>
                                <dt className='text-xs font-bold tracking-[0.2em] text-stone-500 uppercase'>
                                    Most patients
                                </dt>
                                <dd className='mt-2 font-serif text-2xl font-medium tracking-tight text-stone-900'>
                                    <PriceRangeFigures range={range} />
                                </dd>
                            </div>
                        )}
                        <div className='bg-stone-50 p-6 text-center'>
                            <dt className='text-xs font-bold tracking-[0.2em] text-stone-500 uppercase'>
                                Financing
                            </dt>
                            <dd className='mt-2 font-serif text-2xl font-medium tracking-tight text-stone-900'>
                                Available
                            </dd>
                        </div>
                    </dl>

                    <DiscountStatement
                        statement={prices.discountStatement}
                        className='mx-auto mt-6 text-center'
                    />

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
                        Prices are a guide, not a quote. Every price is
                        personalized, ranges are estimates that may change, and
                        your surgeon confirms your price at consultation.{' '}
                        {FINANCING_SENTENCE_SHORT}
                    </p>
                </div>
            </ContainerLayout>
        </section>
    )
}

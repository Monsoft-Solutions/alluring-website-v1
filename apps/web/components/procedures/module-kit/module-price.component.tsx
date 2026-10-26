import Link from 'next/link'
import type { ReactNode } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'

import { PriceTag } from '@/components/shared/price-tag.component'
import { findLinePrice } from '@/lib/claims/procedure-prices.util'
import type { ProcedurePrices } from '@/lib/claims/procedure-prices.util'
import type {
    ProcedurePriceOption,
    ProcedurePricing,
} from '@/lib/types/procedure.type'

import {
    moduleButtonPrimary,
    moduleH3,
    moduleLabel,
    moduleLink,
} from './module-ui.constant'

/**
 * The procedure's prices by variant, from `procedure.pricing.options`: one
 * row per option, its name and who it suits, then its price. Each option
 * names a price-sheet line, and the price is that line's from the pricing
 * resolver (#354), struck through while a discount is on; the graph gives
 * each option an `Offer` from the same line, so the two can't disagree. An
 * option whose line the resolver can't price is left out.
 *
 * Every price is a starting point the surgeon confirms after an exam, so a
 * row reads "From $3,000".
 *
 * A real table with row headers, the shape screen readers and AI engines
 * both read as option → price. It keeps two columns at every width, the
 * note under the name, so a phone reads it without scrolling sideways. No
 * button per row: the section's "Get your exact price" follows it.
 */
export function ModulePriceTable({
    options: allOptions,
    prices,
    heading = 'Prices by type',
    id = 'price-options',
    optionLabel = 'Option',
    priceLabel = 'Price',
    note,
}: {
    options: ProcedurePriceOption[]
    /** The procedure's resolved prices (`getProcedurePrices`). */
    prices: ProcedurePrices
    /** The H3 over the table, which also names it. */
    heading?: string
    /** Anchor for the heading (`{id}-heading`); unique on the page. */
    id?: string
    /** Column headers, e.g. "Type of tummy tuck" and "Price". */
    optionLabel?: string
    priceLabel?: string
    /** A line under the table, e.g. that the surgeon confirms the price. */
    note?: ReactNode
}) {
    const options = allOptions.flatMap((option) => {
        const price = findLinePrice(prices, option.line)
        return price ? [{ ...option, price }] : []
    })
    if (options.length === 0) return null

    const headingId = `${id}-heading`

    return (
        <>
            <h3 id={headingId} className={cn(moduleH3, 'mt-10 md:mt-11')}>
                {heading}
            </h3>
            <table
                aria-labelledby={headingId}
                className='mt-4 w-full max-w-[41.25rem] border-collapse text-left tabular-nums'
            >
                <thead>
                    <tr>
                        <th scope='col' className={cn(moduleLabel, 'pb-2.5')}>
                            {optionLabel}
                        </th>
                        <th
                            scope='col'
                            className={cn(
                                moduleLabel,
                                'pb-2.5 pl-4 text-right'
                            )}
                        >
                            {priceLabel}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {options.map((option) => (
                        <tr
                            key={option.label}
                            className='border-t border-stone-200 last:border-b'
                        >
                            <th
                                scope='row'
                                className='py-3.5 align-top font-normal'
                            >
                                <span className='block text-[1.0625rem] leading-[1.45] font-bold text-stone-900'>
                                    {option.label}
                                </span>
                                {option.note && (
                                    <span className='mt-1 block text-[0.9375rem] leading-[1.5] text-stone-600 md:text-base'>
                                        {option.note}
                                    </span>
                                )}
                            </th>
                            <td className='py-3.5 pl-4 text-right align-top text-[1.0625rem] leading-[1.45] font-bold whitespace-nowrap text-stone-900'>
                                From <PriceTag price={option.price} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {note && (
                <p className='mt-4 max-w-[41.25rem] text-[0.9375rem] leading-[1.55] text-stone-600 md:text-base md:leading-[1.6]'>
                    {note}
                </p>
            )}
        </>
    )
}

/**
 * "What the price includes", from `procedure.pricing.includes`: the site's
 * one price table for the procedure, so this list and every other reader of
 * it say the same thing.
 */
export function ModulePriceIncludes({
    includes,
}: {
    includes: ProcedurePricing['includes']
}) {
    if (includes.length === 0) return null

    return (
        <>
            <h3 className={cn(moduleH3, 'mt-10 md:mt-11')}>
                What the price includes
            </h3>
            <ul className='mt-4 grid gap-3 md:grid-cols-2 md:gap-x-8 md:gap-y-3.5'>
                {includes.map((item) => (
                    <li
                        key={item}
                        className='flex gap-3 text-[1.0625rem] leading-normal text-stone-900'
                    >
                        <Check
                            aria-hidden='true'
                            strokeWidth={2}
                            className='text-gold-600 mt-0.5 size-5 shrink-0'
                        />
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
            <p className='mt-4 max-w-[41.25rem] text-[0.9375rem] leading-[1.55] text-stone-600 md:text-base md:leading-[1.6]'>
                Travel and your stay in Miami are not included. If you are
                flying in, you arrange them yourself.
            </p>
        </>
    )
}

/**
 * What moves the price, from `procedure.pricing.factors`, with an optional
 * closing line of the page's own. The default heading assumes the page
 * publishes a price range; a page with only a starting price passes its own.
 */
export function ModulePriceFactors({
    factors,
    note,
    heading = 'What moves your price within the range',
}: {
    factors: ProcedurePricing['factors']
    note?: string
    heading?: string
}) {
    if (factors.length === 0) return null

    return (
        <>
            <h3 className={cn(moduleH3, 'mt-10 md:mt-11')}>{heading}</h3>
            <dl className='mt-4 grid gap-4.5 md:grid-cols-2 md:gap-x-8 md:gap-y-6'>
                {factors.map((factor) => (
                    <div
                        key={factor.label}
                        className='border-t border-stone-200 pt-3.5'
                    >
                        <dt className='text-[1.0625rem] leading-[1.45] font-bold text-stone-900'>
                            {factor.label}
                        </dt>
                        <dd className='mt-1.5 text-[1.0625rem] leading-[1.6] text-stone-700 md:text-base'>
                            {factor.description}
                        </dd>
                    </div>
                ))}
            </dl>
            {note && (
                <p className='mt-5 text-[1.0625rem] leading-[1.6] text-stone-700 md:text-base'>
                    {note}
                </p>
            )}
        </>
    )
}

/**
 * The financing and offers links, then "Get your exact price". No financing
 * figure: financing is offered, and its terms are the lender's.
 */
export function ModulePriceActions() {
    return (
        <>
            <ul className='mt-4 flex flex-wrap gap-x-7 gap-y-1'>
                <li>
                    <Link
                        href='/plastic-surgery-financing-miami'
                        className={cn(
                            moduleLink,
                            'inline-flex min-h-11 items-center text-base font-bold'
                        )}
                    >
                        See financing options
                    </Link>
                </li>
                <li>
                    <Link
                        href='/miami-plastic-surgery-specials'
                        className={cn(
                            moduleLink,
                            'inline-flex min-h-11 items-center text-base font-bold'
                        )}
                    >
                        Current offers
                    </Link>
                </li>
            </ul>
            <div className='mt-7 max-w-[41.25rem] border-t border-stone-200 pt-5'>
                <p className='text-[1.0625rem] leading-[1.55] font-bold text-stone-900 md:text-lg'>
                    Your surgeon confirms your exact price at your consultation,
                    before you commit to anything.
                </p>
                <a href='#book' className={cn(moduleButtonPrimary, 'mt-5')}>
                    Get your exact price
                </a>
            </div>
        </>
    )
}

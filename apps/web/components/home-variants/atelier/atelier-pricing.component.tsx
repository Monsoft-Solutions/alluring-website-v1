/**
 * Atelier Pricing
 *
 * Price stated openly, framed as removing an obstacle rather than as a
 * deal. "Deal" language is what makes cosmetic surgery pricing feel
 * predatory, and it is exactly wrong for this direction.
 *
 * Starting prices come from the pricing resolver (issue #354), struck
 * through while a discount is on, with the price caveat and the 456.062
 * statement. Financing is named and never quoted (canon D6).
 *
 * Server-rendered.
 */
import Link from 'next/link'

import { PRICE_CAVEAT_SHORT } from '@workspace/shared/claims/prices'

import { DiscountStatement } from '@/components/shared/discount-statement.component'
import { PriceTag } from '@/components/shared/price-tag.component'
import { getFinancingPartnersString } from '@/lib/data/site-config'
import { formatLineName } from '@workspace/shared/claims/pricing'

import {
    getDiscountStatementText,
    getLinePrice,
    getStartingPrice,
} from '@/lib/queries/pricing.query'

/**
 * The procedures the list prices, by claim key, as the list names them. A
 * row named for one line (Lipo 360) reads that line; the others read the
 * starting line and print its name under the row, so "from $3,000" always
 * says it is for a mini tummy tuck (canon §5).
 */
const PRICED: readonly { procedure: string; name: string; line?: string }[] = [
    { procedure: 'breast-augmentation', name: 'Breast augmentation' },
    { procedure: 'lipo', name: 'Lipo 360', line: 'lipo360' },
    { procedure: 'bbl', name: 'BBL' },
    { procedure: 'tummy-tuck', name: 'Tummy tuck' },
    { procedure: 'breast-lift', name: 'Breast lift' },
    { procedure: 'breast-reduction', name: 'Breast reduction' },
]

export async function AtelierPricing() {
    const [rows, statement] = await Promise.all([
        Promise.all(
            PRICED.map(async (row) => ({
                ...row,
                price: row.line
                    ? await getLinePrice(row.procedure, row.line)
                    : await getStartingPrice(row.procedure),
            }))
        ),
        getDiscountStatementText(),
    ])

    return (
        <section
            className='scroll-mt-24 bg-[#F6EDE4] px-6 py-20 md:px-10 md:py-28'
            aria-labelledby='atelier-pricing-heading'
            id='pricing'
        >
            <div className='mx-auto max-w-7xl'>
                <div className='mb-14 max-w-2xl'>
                    <span className='text-xs tracking-[0.3em] text-[#C4674D] uppercase'>
                        What it costs
                    </span>
                    <h2
                        id='atelier-pricing-heading'
                        className='mt-5 font-[family-name:var(--font-fraunces)] text-4xl leading-[1.05] text-[#3D2B23] md:text-5xl'
                    >
                        You should not have to
                        <span className='text-[#C4674D] italic'>
                            {' '}
                            ask twice.
                        </span>
                    </h2>
                    <p className='mt-6 text-lg leading-[1.75] text-[#3D2B23]/70'>
                        Starting prices from the practice&apos;s price list.
                        Financing is available through{' '}
                        {getFinancingPartnersString()} for qualified applicants.
                    </p>
                </div>

                <div className='grid gap-10 lg:grid-cols-12 lg:gap-16'>
                    <ul className='lg:col-span-7'>
                        {rows.map(
                            (row) =>
                                row.price && (
                                    <li
                                        key={row.procedure}
                                        className='flex items-baseline justify-between gap-6 border-b border-[#3D2B23]/12 py-5'
                                    >
                                        <span className='flex flex-col gap-1'>
                                            <span className='font-[family-name:var(--font-fraunces)] text-xl text-[#3D2B23] md:text-2xl'>
                                                {row.name}
                                            </span>
                                            {!row.line && (
                                                <span className='text-sm text-[#3D2B23]/70'>
                                                    {formatLineName(
                                                        row.price.label,
                                                        { capitalized: true }
                                                    )}
                                                </span>
                                            )}
                                        </span>
                                        <span className='shrink-0 font-[family-name:var(--font-fraunces)] text-2xl text-[#3D2B23] tabular-nums md:text-3xl'>
                                            <span className='text-base text-[#3D2B23]/45'>
                                                from{' '}
                                            </span>
                                            <PriceTag price={row.price} />
                                        </span>
                                    </li>
                                )
                        )}
                        <li className='pt-6 text-sm leading-relaxed text-[#3D2B23]/55'>
                            {PRICE_CAVEAT_SHORT}
                            <DiscountStatement
                                statement={statement}
                                className='mt-3 text-[#3D2B23]/70'
                            />
                        </li>
                    </ul>

                    <div className='lg:col-span-5'>
                        <div className='rounded-[2rem] bg-[#E5B9A6] p-8 md:p-10'>
                            <p className='font-[family-name:var(--font-fraunces)] text-xl leading-snug text-[#3D2B23] italic'>
                                Your surgeon confirms your price at
                                consultation.
                            </p>

                            <Link
                                href='#talk'
                                className='mt-8 inline-block rounded-full bg-[#2A1D17] px-7 py-3.5 text-sm font-medium text-[#F6EDE4] transition-colors hover:bg-[#3D2B23]'
                            >
                                Get your exact figure
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

/**
 * Atelier Pricing
 *
 * Price stated openly, framed as removing an obstacle rather than as a
 * deal. "Deal" language is what makes cosmetic surgery pricing feel
 * predatory, and it is exactly wrong for this direction.
 *
 * Figures and disclaimer both come from `weekly-payments.data.ts`.
 *
 * Server-rendered.
 */
import Link from 'next/link'

import { getFinancingPartnersString } from '@/lib/data/site-config'
import {
    WEEKLY_PAYMENT_DISCLAIMER,
    WEEKLY_PAYMENT_OPTIONS,
} from '@/lib/data/weekly-payments.data'

const INCLUDED: readonly string[] = [
    'Surgeon fee',
    'Anesthesia and anesthesiologist',
    'Accredited facility',
    'Pre-op labs and clearance',
    'Compression garments',
    'Every follow-up visit',
] as const

export function AtelierPricing() {
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
                        Most people finance rather than pay in full, so this is
                        how the numbers usually get discussed. Through{' '}
                        {getFinancingPartnersString()}.
                    </p>
                </div>

                <div className='grid gap-10 lg:grid-cols-12 lg:gap-16'>
                    <ul className='lg:col-span-7'>
                        {WEEKLY_PAYMENT_OPTIONS.map((option) => (
                            <li
                                key={option.procedure}
                                className='flex items-baseline justify-between gap-6 border-b border-[#3D2B23]/12 py-5'
                            >
                                <span className='font-[family-name:var(--font-fraunces)] text-xl text-[#3D2B23] md:text-2xl'>
                                    {option.procedure}
                                    {option.highlight && (
                                        <span className='ml-3 align-middle text-[10px] tracking-[0.2em] text-[#C4674D] uppercase'>
                                            {option.highlight}
                                        </span>
                                    )}
                                </span>
                                <span className='shrink-0 font-[family-name:var(--font-fraunces)] text-2xl text-[#3D2B23] tabular-nums md:text-3xl'>
                                    ${option.weeklyPayment}
                                    <span className='text-base text-[#3D2B23]/45'>
                                        /wk
                                    </span>
                                </span>
                            </li>
                        ))}
                        <li className='pt-6 text-sm leading-relaxed text-[#3D2B23]/55'>
                            {WEEKLY_PAYMENT_DISCLAIMER}
                        </li>
                    </ul>

                    <div className='lg:col-span-5'>
                        <div className='rounded-[2rem] bg-[#E5B9A6] p-8 md:p-10'>
                            <h3 className='mb-6 text-xs tracking-[0.2em] text-[#3D2B23]/60 uppercase'>
                                Every quote includes
                            </h3>
                            <ul className='space-y-3'>
                                {INCLUDED.map((item) => (
                                    <li
                                        key={item}
                                        className='flex items-baseline gap-3 text-[#3D2B23]'
                                    >
                                        <span
                                            className='text-[#C4674D]'
                                            aria-hidden='true'
                                        >
                                            ✓
                                        </span>
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <p className='mt-8 border-t border-[#3D2B23]/15 pt-6 font-[family-name:var(--font-fraunces)] text-xl leading-snug text-[#3D2B23] italic'>
                                If the price changes between your consultation
                                and your surgery, we got something wrong — not
                                you.
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

/**
 * CostClarity Component
 *
 * Price and financing, answered in one place.
 *
 * Conversion rationale: "can I afford this?" is the objection that ends most
 * cosmetic-surgery research sessions, and it is the reason this audience
 * researches for months. The previous homepage split the answer across a
 * pricing preview and a separate financing page. This section states the
 * weekly number, what the number includes, and what it does not — before
 * asking for anything.
 *
 * Server-rendered. Figures come from the same source used by the specials
 * and contact pages, so they stay consistent site-wide.
 */
import Link from 'next/link'
import {
    ArrowRight,
    Building2,
    Calendar,
    CreditCard,
    Percent,
    Stethoscope,
    UserCheck,
} from 'lucide-react'

import { Button } from '@workspace/ui/components/button'

import { SectionContainer } from '@/components/shared/section-container.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { getFinancingPartnersString } from '@/lib/data/site-config'

type WeeklyPrice = {
    readonly procedure: string
    readonly slug: string
    readonly weekly: number
    readonly note?: string
}

/**
 * Weekly payment figures, matching the WeeklyPayments component used on the
 * specials and contact pages. Framed weekly rather than monthly because it
 * is the unit this audience already budgets in.
 */
const WEEKLY_PRICES: readonly WeeklyPrice[] = [
    {
        procedure: 'Breast Augmentation',
        slug: 'breast-augmentation-miami',
        weekly: 27,
        note: 'Most requested',
    },
    {
        procedure: 'Liposuction 360',
        slug: 'liposuction-miami',
        weekly: 27,
    },
    {
        procedure: 'Brazilian Butt Lift',
        slug: 'brazilian-butt-lift-bbl-miami',
        weekly: 34,
    },
    {
        procedure: 'Tummy Tuck',
        slug: 'tummy-tuck-miami',
        weekly: 34,
    },
    {
        procedure: 'Breast Lift',
        slug: 'breast-lift-miami',
        weekly: 41,
    },
    {
        procedure: 'Mommy Makeover',
        slug: 'mommy-makeover-miami',
        weekly: 49,
    },
] as const

/** What the quoted price covers — the "surprise fee" objection, pre-empted. */
const INCLUDED = [
    { icon: <Stethoscope className='h-4 w-4' />, text: 'Surgeon’s fee' },
    { icon: <Building2 className='h-4 w-4' />, text: 'Accredited facility' },
    { icon: <UserCheck className='h-4 w-4' />, text: 'Anesthesia team' },
    { icon: <Calendar className='h-4 w-4' />, text: 'All follow-up visits' },
    { icon: <CreditCard className='h-4 w-4' />, text: 'Post-op garments' },
    { icon: <Percent className='h-4 w-4' />, text: 'Pre-op lab work' },
] as const

export function CostClarity() {
    return (
        <SectionContainer
            id='cost'
            variant='default'
            className='bg-white'
            paddingY='py-20 md:py-28'
            ariaLabel='Procedure cost and financing'
        >
            <ContentWrapper size='lg' paddingX='px-6 md:px-12'>
                {/* Header */}
                <div className='mb-14 max-w-2xl'>
                    <span className='text-gold-500 mb-4 block text-xs font-bold tracking-[0.25em] uppercase'>
                        The Honest Part
                    </span>
                    <h2 className='mb-5 font-serif text-4xl leading-tight text-stone-900 md:text-5xl'>
                        Let&apos;s talk about
                        <span className='text-stone-400 italic'>
                            {' '}
                            what it costs.
                        </span>
                    </h2>
                    <p className='text-lg leading-relaxed text-stone-600'>
                        Most clinics make you book a consultation before
                        they&apos;ll say a number. Here&apos;s ours. Payments
                        below are typical approved plans through{' '}
                        {getFinancingPartnersString()} — your rate depends on
                        credit and term.
                    </p>
                </div>

                <div className='grid gap-10 lg:grid-cols-12 lg:gap-14'>
                    {/* Price list */}
                    <div className='lg:col-span-7'>
                        <ul className='divide-y divide-stone-200 border-y border-stone-200'>
                            {WEEKLY_PRICES.map((item) => (
                                <li key={item.slug}>
                                    <Link
                                        href={`/procedures/${item.slug}`}
                                        className='group flex items-center justify-between gap-4 py-5 transition-colors hover:bg-stone-50'
                                    >
                                        <div className='min-w-0'>
                                            <span className='group-hover:text-gold-700 block font-serif text-xl text-stone-900 transition-colors md:text-2xl'>
                                                {item.procedure}
                                            </span>
                                            {item.note && (
                                                <span className='text-gold-600 mt-1 block text-[11px] font-bold tracking-widest uppercase'>
                                                    {item.note}
                                                </span>
                                            )}
                                        </div>

                                        <div className='flex shrink-0 items-center gap-4'>
                                            <span className='text-right'>
                                                <span className='block text-2xl font-bold text-stone-900'>
                                                    ${item.weekly}
                                                </span>
                                                <span className='block text-xs text-stone-500'>
                                                    per week
                                                </span>
                                            </span>
                                            <ArrowRight
                                                className='group-hover:text-gold-600 h-4 w-4 text-stone-300 transition-all duration-300 group-hover:translate-x-1'
                                                aria-hidden='true'
                                            />
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        <p className='mt-5 text-xs leading-relaxed text-stone-500'>
                            Weekly figures are illustrative of approved
                            financing plans and are not a quote. Your surgical
                            plan, anatomy and lender terms determine final
                            pricing — which you receive in writing at your free
                            consultation.
                        </p>
                    </div>

                    {/* What's included + CTA */}
                    <div className='lg:col-span-5'>
                        <div className='border border-stone-200 bg-stone-50 p-8'>
                            <div className='bg-gold-100 text-gold-700 mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold tracking-widest uppercase'>
                                <Percent
                                    className='h-3 w-3'
                                    aria-hidden='true'
                                />
                                0% APR options available
                            </div>

                            <h3 className='mb-6 font-serif text-2xl text-stone-900'>
                                Your price includes all of this
                            </h3>

                            <ul className='mb-8 grid gap-3'>
                                {INCLUDED.map((item) => (
                                    <li
                                        key={item.text}
                                        className='flex items-center gap-3 text-stone-700'
                                    >
                                        <span
                                            className='text-gold-500 shrink-0'
                                            aria-hidden='true'
                                        >
                                            {item.icon}
                                        </span>
                                        {item.text}
                                    </li>
                                ))}
                            </ul>

                            <p className='mb-8 border-t border-stone-200 pt-6 text-sm leading-relaxed text-stone-600'>
                                No consultation fee. No facility surcharge added
                                later. The number you approve is the number you
                                pay.
                            </p>

                            <div className='flex flex-col gap-3'>
                                <Button size='md' variant='gold' asChild>
                                    <Link href='#book-consultation'>
                                        <span className='flex items-center justify-center'>
                                            Get My Exact Price
                                            <ArrowRight
                                                className='ml-3 h-4 w-4'
                                                aria-hidden='true'
                                            />
                                        </span>
                                    </Link>
                                </Button>
                                <Button size='md' variant='outline' asChild>
                                    <Link href='/plastic-surgery-financing-miami'>
                                        See Financing Options
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}

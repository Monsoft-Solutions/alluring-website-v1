import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'

import { bblFigure } from '@/lib/data/procedures/facts/bbl.facts'
import { getLipoFact, lipoFigure } from '@/lib/data/procedures/facts/lipo.facts'
import { FINANCING_PARTNERS } from '@/lib/data/site-config'

import {
    HOME_CHAT_ID,
    HOME_PROCEDURES,
    HOME_SECTION_IDS,
    PRICE_VARIABLES,
    homeContainer,
    homeEyebrow,
    homeHeading,
    homeLink,
    homePrimaryButton,
} from './home-page.constant'

type HomePricesProps = {
    /** The featured promotion's title and page, when one is running. */
    promotion?: { title: string; href: string } | null
}

/**
 * Prices, stated where they are settled and promised in writing where they
 * are not. Only two starting prices are settled (BBL, decided 2026-09-15;
 * Lipo 360, from the practice's price sheet); every other procedure waits on
 * #232, so the third card says how the quote arrives instead of guessing.
 * Figures and their wording come from the facts files.
 *
 * Only two of thirteen competitor homepages show a dollar figure at all.
 */
export function HomePrices({ promotion }: HomePricesProps) {
    const cards = [
        {
            key: 'lipo',
            name: HOME_PROCEDURES.lipo.name,
            price: lipoFigure('price-starting-at'),
            note: getLipoFact('price-added-area').statement,
            href: HOME_PROCEDURES.lipo.href,
            chat: HOME_PROCEDURES.lipo.chat,
        },
        {
            key: 'bbl',
            name: HOME_PROCEDURES.bbl.name,
            price: bblFigure('price-starting-at'),
            note: `Most patients pay ${bblFigure('price-most-patients')}. Every price is set for the patient, and your surgeon confirms yours at consultation.`,
            href: HOME_PROCEDURES.bbl.href,
            chat: HOME_PROCEDURES.bbl.chat,
        },
    ] as const

    return (
        <section
            id={HOME_SECTION_IDS.prices}
            aria-labelledby='prices-title'
            className='hp-defer relative overflow-hidden bg-[linear-gradient(180deg,var(--hp-ivory),var(--hp-sand))] py-16 md:py-28'
        >
            <div className={homeContainer}>
                <div className='flex flex-wrap items-end justify-between gap-6'>
                    <div className='max-w-[40rem]'>
                        <p className={homeEyebrow}>Prices</p>
                        <h2
                            id='prices-title'
                            className={cn(homeHeading, 'mt-4 text-stone-950')}
                        >
                            Real prices.{' '}
                            <em className='text-[#8a6c12] italic'>Up front.</em>
                        </h2>
                        <p className='mt-5 text-lg leading-relaxed text-stone-600'>
                            The starting prices we can state today, and a
                            written quote for everything else after your free
                            consultation, before you book a thing.
                        </p>
                    </div>
                    {promotion && (
                        <Link
                            href={promotion.href}
                            data-cta='home_prices_promotion'
                            className='inline-flex items-center gap-2 rounded-full border border-stone-900/10 bg-white px-4 py-2 text-sm font-bold text-stone-900 shadow-sm transition hover:border-stone-900/30'
                        >
                            <span
                                className='bg-gold-400 size-2 rounded-full'
                                aria-hidden='true'
                            />
                            This month: {promotion.title} →
                        </Link>
                    )}
                </div>

                <ul className='mt-10 grid gap-4 md:mt-14 md:grid-cols-3 md:gap-5'>
                    {cards.map((card) => (
                        <li
                            key={card.key}
                            className='flex flex-col rounded-[2rem] border border-white bg-white/80 p-7 shadow-[0_40px_80px_-55px_rgba(28,25,23,0.6)] backdrop-blur-xl md:p-8'
                        >
                            <h3 className='text-sm font-bold tracking-[0.16em] text-stone-600 uppercase'>
                                {card.name}
                            </h3>
                            <p className='mt-3 font-serif text-stone-950'>
                                <span className='text-lg'>from </span>
                                <span className='text-[3.5rem] leading-none tracking-[-0.03em] md:text-[4rem]'>
                                    {card.price}
                                </span>
                            </p>
                            <p className='mt-4 flex-1 text-[0.9375rem] leading-relaxed text-stone-600'>
                                {card.note}
                            </p>
                            <div className='mt-6 flex flex-wrap items-center gap-x-5 gap-y-3'>
                                <a
                                    href={`#${HOME_CHAT_ID}`}
                                    data-consult-procedure={card.chat}
                                    data-cta='home_prices_quote'
                                    className={homePrimaryButton}
                                >
                                    Get my quote
                                </a>
                                <Link
                                    href={card.href}
                                    className={cn(
                                        homeLink,
                                        'text-sm text-stone-900'
                                    )}
                                >
                                    Details
                                </Link>
                            </div>
                        </li>
                    ))}
                    <li className='flex flex-col rounded-[2rem] bg-stone-950 p-7 text-stone-100 md:p-8'>
                        <h3 className='text-gold-300 text-sm font-bold tracking-[0.16em] uppercase'>
                            Everything else
                        </h3>
                        <p className='mt-3 font-serif text-[2rem] leading-tight text-stone-50'>
                            Your price, in writing.
                        </p>
                        <p className='mt-4 flex-1 text-[0.9375rem] leading-relaxed text-stone-300'>
                            Tummy tuck, mommy makeover, breast and face
                            procedures are priced for your body and your plan.
                            You get the number in writing after a free
                            consultation, in person or by video.
                        </p>
                        <a
                            href={`#${HOME_CHAT_ID}`}
                            data-cta='home_prices_quote_other'
                            className='border-gold-400/60 hover:bg-gold-400 mt-6 inline-flex min-h-12 items-center justify-center self-start rounded-full border px-6 font-bold text-stone-50 transition-colors hover:text-stone-950'
                        >
                            Request my quote
                        </a>
                    </li>
                </ul>

                <p className='mt-4 text-sm text-stone-600'>{PRICE_VARIABLES}</p>

                <div className='mt-5 flex flex-col items-start justify-between gap-4 rounded-[1.5rem] border border-stone-900/10 bg-white/60 px-6 py-5 md:flex-row md:items-center'>
                    <p className='text-stone-700'>
                        <strong className='text-stone-950'>
                            Pay over time.
                        </strong>{' '}
                        Financing through{' '}
                        {FINANCING_PARTNERS.slice(0, -1).join(', ')} and{' '}
                        {FINANCING_PARTNERS.at(-1)}, subject to credit approval.
                    </p>
                    <Link
                        href='/plastic-surgery-financing-miami'
                        className={cn(homeLink, 'shrink-0 text-stone-900')}
                    >
                        See financing options
                    </Link>
                </div>
            </div>
        </section>
    )
}

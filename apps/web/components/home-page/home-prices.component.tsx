import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'

import { bblFigure } from '@/lib/data/procedures/facts/bbl.facts'
import { getLipoFact, lipoFigure } from '@/lib/data/procedures/facts/lipo.facts'
import { FINANCING_PARTNERS } from '@/lib/data/site-config'

import { HomeEyebrow } from './home-eyebrow.component'
import {
    HOME_CHAT_ID,
    HOME_PROCEDURES,
    HOME_SECTION_IDS,
    HOME_SECTION_INDEX,
    PRICE_VARIABLES,
    homeContainer,
    homeHeading,
    homeLead,
    homeLink,
    homePrimaryButton,
    homePrimaryButtonOnDark,
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
            className='hp-defer relative overflow-hidden bg-[linear-gradient(180deg,var(--hp-porcelain),var(--hp-linen))] py-16 md:py-28'
        >
            <div className={homeContainer}>
                <div className='flex flex-wrap items-end justify-between gap-6'>
                    <div className='max-w-[42rem]'>
                        <HomeEyebrow index={HOME_SECTION_INDEX.prices}>
                            Prices
                        </HomeEyebrow>
                        <h2
                            id='prices-title'
                            className={cn(homeHeading, 'mt-5')}
                        >
                            Real prices. <em>Up front.</em>
                        </h2>
                        <p
                            className={cn(
                                homeLead,
                                'mt-6 text-[var(--hp-fg-2)]'
                            )}
                        >
                            The starting prices we can state today, and a
                            written quote for everything else after your free
                            consultation, before you book a thing.
                        </p>
                    </div>
                    {promotion && (
                        <Link
                            href={promotion.href}
                            data-cta='home_prices_promotion'
                            className='inline-flex items-center gap-2.5 rounded-full border border-[var(--hp-line)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--hp-ink)] transition-colors hover:border-[var(--hp-ink)]'
                        >
                            <span
                                className='size-2 rounded-full bg-[var(--hp-champagne-2)]'
                                aria-hidden='true'
                            />
                            This month: {promotion.title} →
                        </Link>
                    )}
                </div>

                <ul className='mt-10 grid gap-4 md:mt-14 md:grid-cols-2 md:gap-5 lg:grid-cols-3'>
                    {cards.map((card) => (
                        <li
                            key={card.key}
                            className='hp-card flex flex-col p-7 md:p-8'
                        >
                            <h3 className='hp-eyebrow'>{card.name}</h3>
                            <p className='mt-6 text-[var(--hp-ink)]'>
                                <span className='block text-[0.75rem] font-semibold tracking-[0.2em] text-[var(--hp-mute)] uppercase'>
                                    From
                                </span>
                                <span className='hp-display mt-2 block text-[4.25rem] leading-[0.9] font-medium tracking-[-0.02em] lg:text-[4.5rem] xl:text-[5.25rem]'>
                                    {card.price}
                                </span>
                            </p>
                            <p className='mt-5 flex-1 border-t border-[var(--hp-line)] pt-5 text-[0.9375rem] leading-relaxed text-[var(--hp-ink-2)]'>
                                {card.note}
                            </p>
                            <div className='mt-7 flex flex-wrap items-center gap-x-5 gap-y-3'>
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
                                    className={cn(homeLink, 'text-sm')}
                                >
                                    Details
                                </Link>
                            </div>
                        </li>
                    ))}
                    <li className='hp-dark hp-grain flex flex-col rounded-[0.625rem] p-7 md:col-span-2 md:p-8 lg:col-span-1'>
                        <h3 className='hp-eyebrow'>Everything else</h3>
                        <p className='hp-display mt-6 text-[2.5rem] leading-[1] tracking-[-0.02em] md:text-[2.75rem]'>
                            Your price, <em>in writing.</em>
                        </p>
                        <p className='mt-5 flex-1 border-t border-[var(--hp-rule)] pt-5 text-[0.9375rem] leading-relaxed text-[var(--hp-fg-2)]'>
                            Tummy tuck, mommy makeover, breast and face
                            procedures are priced for your body and your plan.
                            You get the number in writing after a free
                            consultation, in person or by video.
                        </p>
                        <a
                            href={`#${HOME_CHAT_ID}`}
                            data-cta='home_prices_quote_other'
                            className={cn(
                                homePrimaryButtonOnDark,
                                'mt-7 self-start'
                            )}
                        >
                            Request my quote
                        </a>
                    </li>
                </ul>

                <p className='mt-5 text-sm text-[var(--hp-ink-2)]'>
                    {PRICE_VARIABLES}
                </p>

                <div className='mt-8 flex flex-col items-start justify-between gap-4 border-y border-[var(--hp-line)] py-6 md:flex-row md:items-center'>
                    <p className='text-[var(--hp-ink-2)]'>
                        <strong className='hp-display hp-display--small mr-1.5 text-[1.375rem] font-normal text-[var(--hp-ink)]'>
                            Pay over <em>time.</em>
                        </strong>{' '}
                        Financing through{' '}
                        {FINANCING_PARTNERS.slice(0, -1).join(', ')} and{' '}
                        {FINANCING_PARTNERS.at(-1)}, subject to credit approval.
                    </p>
                    <Link
                        href='/plastic-surgery-financing-miami'
                        className={cn(homeLink, 'shrink-0')}
                    >
                        See financing options
                    </Link>
                </div>
            </div>
        </section>
    )
}

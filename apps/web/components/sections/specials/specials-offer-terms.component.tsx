/**
 * The offer's terms, in words, right under the thread: what it is, when it
 * ends, and that financing still applies. The text is the promotion's own
 * (edited in admin → Promotions), so this block never disagrees with it.
 */

import Link from 'next/link'

interface SpecialsOfferTermsProps {
    readonly chatId: string
    readonly title: string
    readonly terms: string | null
    readonly endsOn: string | null
    readonly slug: string
}

export function SpecialsOfferTerms({
    chatId,
    title,
    terms,
    endsOn,
    slug,
}: SpecialsOfferTermsProps) {
    return (
        <section
            id='offer-terms'
            aria-labelledby='offer-terms-title'
            className='bg-stone-50 px-4 py-14 sm:py-20'
        >
            <div className='mx-auto grid max-w-5xl gap-8 md:grid-cols-[1fr_280px] md:gap-12'>
                <div>
                    <p className='text-gold-600 text-[11px] font-bold tracking-[0.18em] uppercase'>
                        About the offer
                    </p>
                    <h2
                        id='offer-terms-title'
                        className='mt-3 font-serif text-3xl text-balance text-stone-900 sm:text-4xl'
                    >
                        {title}
                    </h2>
                    {terms && (
                        <p className='mt-5 max-w-2xl text-base leading-relaxed text-stone-600 sm:text-lg'>
                            {terms}
                        </p>
                    )}
                    <p className='mt-5 text-sm text-stone-500'>
                        <Link
                            href={`/promotions/${slug}`}
                            className='font-semibold text-stone-700 underline underline-offset-2'
                        >
                            Full offer details
                        </Link>
                    </p>
                </div>

                <dl className='grid content-start gap-4 rounded-2xl border border-stone-200 bg-white p-5'>
                    {endsOn && (
                        <div>
                            <dt className='text-[10.5px] font-bold tracking-[0.16em] text-stone-500 uppercase'>
                                Ends
                            </dt>
                            <dd className='mt-1 font-serif text-2xl text-stone-900'>
                                {endsOn}
                            </dd>
                        </div>
                    )}
                    <div>
                        <dt className='text-[10.5px] font-bold tracking-[0.16em] text-stone-500 uppercase'>
                            Your price
                        </dt>
                        <dd className='mt-1 text-sm leading-relaxed text-stone-700'>
                            Personalized at your free consultation, all in
                            writing.
                        </dd>
                    </div>
                    <div>
                        <dt className='text-[10.5px] font-bold tracking-[0.16em] text-stone-500 uppercase'>
                            Financing
                        </dt>
                        <dd className='mt-1 text-sm leading-relaxed text-stone-700'>
                            Can be combined with the offer.{' '}
                            <Link
                                href='/plastic-surgery-financing-miami'
                                className='font-semibold underline underline-offset-2'
                            >
                                See options
                            </Link>
                        </dd>
                    </div>
                    <a
                        href={`#${chatId}`}
                        className='mt-1 inline-flex min-h-12 items-center justify-center rounded-xl bg-stone-900 px-5 text-sm font-bold text-stone-50'
                    >
                        Claim the offer →
                    </a>
                </dl>
            </div>
        </section>
    )
}

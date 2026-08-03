/**
 * Atelier Procedures
 *
 * Procedures grouped by the part of the body they address and labelled in
 * the visitor's language before the clinical name — "after children"
 * before "mommy makeover". Consistent with the direction's premise that
 * this practice meets people where they are.
 *
 * Real recovery windows come from each procedure's `quickStats` so this
 * cannot drift from the canonical procedure pages.
 *
 * Server-rendered.
 */
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

import { procedures } from '@/lib/data/procedures.data'

/** Plain-language framing for each procedure, in display order. */
const FRAMING: readonly {
    readonly slug: string
    readonly plain: string
}[] = [
    { slug: 'mommy-makeover-miami', plain: 'After children' },
    { slug: 'brazilian-butt-lift-bbl-miami', plain: 'Shape and proportion' },
    { slug: 'breast-augmentation-miami', plain: 'Fuller' },
    { slug: 'breast-lift-miami', plain: 'Lifted' },
    { slug: 'breast-reduction-miami', plain: 'Smaller, and comfortable' },
    { slug: 'tummy-tuck-miami', plain: 'A flatter stomach' },
    { slug: 'liposuction-miami', plain: 'Stubborn areas' },
    { slug: 'facelift-miami', plain: 'A rested face' },
    { slug: 'blepharoplasty-miami', plain: 'Tired eyes' },
] as const

export function AtelierProcedures() {
    // flatMap rather than map().filter(): filtering on a nested property
    // does not narrow the property's type, so `procedure` would stay
    // `Procedure | undefined` in the JSX below.
    const items = FRAMING.flatMap((entry) => {
        const procedure = procedures.find((p) => p.slug === entry.slug)

        return procedure ? [{ plain: entry.plain, procedure }] : []
    })

    return (
        <section
            className='scroll-mt-24 bg-[#EFE3D6] px-6 py-20 md:px-10 md:py-28'
            aria-labelledby='atelier-procedures-heading'
            id='procedures'
        >
            <div className='mx-auto max-w-7xl'>
                <div className='mb-14 max-w-2xl'>
                    <span className='text-xs tracking-[0.3em] text-[#C4674D] uppercase'>
                        What we do
                    </span>
                    <h2
                        id='atelier-procedures-heading'
                        className='mt-5 font-[family-name:var(--font-fraunces)] text-4xl leading-[1.05] text-[#3D2B23] md:text-5xl'
                    >
                        Say it however
                        <span className='text-[#C4674D] italic'>
                            {' '}
                            makes sense to you.
                        </span>
                    </h2>
                    <p className='mt-6 text-lg leading-[1.75] text-[#3D2B23]/70'>
                        You do not need the clinical word. Times below are the
                        typical return to desk work — your surgeon gives you a
                        written week-by-week plan before you book anything.
                    </p>
                </div>

                <ul className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                    {items.map(({ plain, procedure }) => (
                        <li key={procedure.slug}>
                            <Link
                                href={`/procedures/${procedure.slug}`}
                                className='group flex h-full flex-col rounded-[1.75rem] bg-[#F6EDE4] p-7 transition-all duration-300 hover:bg-[#2A1D17]'
                            >
                                <span className='text-xs tracking-[0.2em] text-[#C4674D] uppercase transition-colors group-hover:text-[#E5B9A6]'>
                                    {plain}
                                </span>
                                <h3 className='mt-4 font-[family-name:var(--font-fraunces)] text-2xl leading-snug text-[#3D2B23] transition-colors group-hover:text-[#F6EDE4]'>
                                    {procedure.title.replace(
                                        /\s+(in\s+)?Miami\b.*$/i,
                                        ''
                                    )}
                                </h3>
                                <p className='mt-auto flex items-center justify-between gap-4 pt-8 text-sm text-[#3D2B23]/55 transition-colors group-hover:text-[#F6EDE4]/60'>
                                    <span>
                                        {procedure.quickStats?.recovery ??
                                            'Recovery varies'}
                                    </span>
                                    <ArrowUpRight
                                        className='h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5'
                                        aria-hidden='true'
                                    />
                                </p>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}

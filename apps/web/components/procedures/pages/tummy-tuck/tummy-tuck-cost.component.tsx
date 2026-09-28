import Link from 'next/link'
import { Check } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'

import { ModuleComparison } from '@/components/procedures/module-kit/module-comparison.component'
import {
    ModulePriceActions,
    ModulePriceFactors,
    ModulePriceIncludes,
    ModulePriceTable,
} from '@/components/procedures/module-kit/module-price.component'
import {
    moduleBody,
    moduleH3,
    moduleLink,
    moduleSectionPad,
} from '@/components/procedures/module-kit/module-ui.constant'
import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'
import { sourceAnchorId } from '@/components/procedures/sections/sources-list.component'
import { tummyTuckFigure } from '@/lib/data/procedures/facts/tummy-tuck.facts'
import { getFinancingPartnersString } from '@/lib/data/site-config'
import type { ProcedurePricing } from '@/lib/types/procedure.type'

import { TummyTuckIncision } from './tummy-tuck-incision.component'

/** What any itemized tummy tuck quote should spell out, ours included. */
const quoteLines = [
    'Which type of tummy tuck, and whether it repairs your muscles',
    "The surgeon's fee",
    'Anesthesia, and who gives it',
    'The surgical facility',
    'Your compression garment',
    'Follow-up visits after surgery',
]

/**
 * "How much is a tummy tuck in Miami?" Keeps `id="pricing"`: blog posts and
 * other pages link to it (the re-scoped comparison post among them), and
 * the jump nav's "Cost" does too.
 *
 * Price depends on which tummy tuck she needs, so the section is the page's
 * chooser as well: the five prices from `procedure.pricing.options` (the
 * site's one tummy tuck price table, set from the practice's price sheet of
 * 2026-09-15), then mini, full and extended side by side with each incision
 * drawn. What the price includes still waits on the owner, so the section
 * doesn't claim any inclusion: it lists what any quote should spell out and
 * asks readers to get ours itemized too. `pricing.includes` fills the kit's
 * list the day the owner confirms it.
 *
 * The ASPS national average makes "affordable" concrete without the word.
 * It is a surgeon's fee only, so the comparison always says what it leaves
 * out.
 */
export function TummyTuckCost({ pricing }: { pricing: ProcedurePricing }) {
    return (
        <AnswerBlock
            id='pricing'
            question='How much is a tummy tuck in Miami?'
            className={moduleSectionPad}
            answer={`At Alluring, a mini tummy tuck is ${tummyTuckFigure('price-mini')}, a full tummy tuck ${tummyTuckFigure('price-full')} and an extended tummy tuck ${tummyTuckFigure('price-extended')}; the table below lists all five types. Which one you need depends on where your loose skin sits and whether your muscles need repair, and your surgeon confirms your price after an exam.`}
        >
            <ModulePriceTable
                options={pricing.options ?? []}
                heading='Prices by type of tummy tuck'
                id='tummy-tuck-prices'
                optionLabel='Type'
                priceLabel='Price'
                note={
                    <>
                        List prices from our price sheet. Liposuction of the
                        abdomen and flanks, added to a tummy tuck, is{' '}
                        {tummyTuckFigure('price-lipo-add-on')}. Prices are
                        estimates and may change.
                    </>
                }
            />

            <ModuleComparison
                caption='Mini, full or extended: which one fits?'
                columns={[
                    { key: 'mini', label: 'Mini' },
                    { key: 'full', label: 'Full' },
                    { key: 'extended', label: 'Extended' },
                ]}
                rows={[
                    {
                        label: 'Where the loose skin is',
                        cells: [
                            'Below the belly button',
                            'Above and below the belly button, not reaching the hips',
                            'Across the abdomen and around the flanks',
                        ],
                    },
                    {
                        label: 'Muscle repair',
                        cells: [
                            'Not included on our price list',
                            'Usually, when the muscles have separated',
                            'Usually, when the muscles have separated',
                        ],
                    },
                    {
                        label: 'The incision',
                        cells: [
                            <TummyTuckIncision key='mini' type='mini'>
                                About the length of a C-section scar,{' '}
                                {tummyTuckFigure('mini-scar-3-6-inches')}. The
                                belly button is generally left alone.
                            </TummyTuckIncision>,
                            <TummyTuckIncision key='full' type='full'>
                                Low, from hip bone to hip bone, usually with one
                                around the belly button.
                            </TummyTuckIncision>,
                            <TummyTuckIncision key='extended' type='extended'>
                                Longer, around to the flanks, with one around
                                the belly button.
                            </TummyTuckIncision>,
                        ],
                    },
                    {
                        label: 'Back to work',
                        cells: [
                            tummyTuckFigure('work-by-type'),
                            'A couple of weeks, for non-strenuous work',
                            tummyTuckFigure('work-by-type', 1),
                        ],
                    },
                ]}
                note={
                    <>
                        Incisions from Cleveland Clinic and Samir Rao, MD;
                        muscle repair from ASPS, which says a tummy tuck
                        restores separated muscles in most cases; time off work
                        from Samir Rao, MD, on the ASPS website. The extended
                        mini and the fleur-de-lis are in the price table above.
                        Your surgeon tells you which tummy tuck fits you at your
                        exam.
                    </>
                }
            />
            <p className={cn(moduleBody, 'mt-5')}>
                Considering a mini?{' '}
                <Link
                    href='/what-is-a-tummy-tuck-without-muscle-repair-called'
                    className={moduleLink}
                >
                    What a tummy tuck without muscle repair is called
                </Link>
            </p>

            <div className='border-gold-400 mt-10 max-w-[41.25rem] border-l-[3px] bg-stone-50 px-5 py-4.5 md:mt-11 md:px-6 md:py-5'>
                <h3 className='text-[0.9375rem] leading-[1.45] font-bold text-stone-900'>
                    For comparison
                </h3>
                <p className='mt-1.5 text-[1.0625rem] leading-[1.6] text-stone-700 tabular-nums md:text-base'>
                    The American Society of Plastic Surgeons puts the average
                    cost of a tummy tuck at{' '}
                    {tummyTuckFigure('asps-average-fee')}, a surgeon&apos;s fee
                    that does not include anesthesia, operating room facilities
                    or other related expenses. Ask what any quote, ours
                    included, leaves out.{' '}
                    <a
                        href={`#${sourceAnchorId('asps-tummy-tuck-cost')}`}
                        className='text-sm whitespace-nowrap text-stone-500 underline decoration-stone-300 underline-offset-4 hover:text-stone-900'
                    >
                        Source
                    </a>
                </p>
            </div>

            <ModulePriceIncludes includes={pricing.includes} />
            {pricing.includes.length === 0 && (
                <>
                    <h3 className={cn(moduleH3, 'mt-10 md:mt-11')}>
                        What your quote should spell out
                    </h3>
                    <ul className='mt-4 grid gap-3 md:grid-cols-2 md:gap-x-8 md:gap-y-3.5'>
                        {quoteLines.map((line) => (
                            <li
                                key={line}
                                className='flex gap-3 text-[1.0625rem] leading-normal text-stone-900'
                            >
                                <Check
                                    aria-hidden='true'
                                    strokeWidth={2}
                                    className='text-gold-600 mt-0.5 size-5 shrink-0'
                                />
                                <span>{line}</span>
                            </li>
                        ))}
                    </ul>
                    <p className='mt-4 max-w-[41.25rem] text-[0.9375rem] leading-[1.55] text-stone-600 md:text-base md:leading-[1.6]'>
                        Ask for every line in writing, from us and from any
                        clinic you compare. Travel and your stay in Miami are
                        not included; if you are flying in, you arrange them
                        yourself.
                    </p>
                </>
            )}

            <ModulePriceFactors
                factors={pricing.factors}
                heading='What moves your price'
            />

            <h3 className={cn(moduleH3, 'mt-10 md:mt-11')}>
                Why some tummy tuck offers cost less
            </h3>
            <p className={cn(moduleBody, 'mt-3.5')}>
                A low advertised tummy tuck price may be for a mini, which
                treats only the skin below the belly button and, on our price
                list, doesn&apos;t repair the muscles. Some offers also leave
                out anesthesia, the facility, the garment or follow-up visits,
                or run as a special that ends this week. Compare itemized quotes
                for the same type of tummy tuck, and ask who performs the
                surgery and where.
            </p>
            <p className={cn(moduleBody, 'mt-5')}>
                Financing is available through {getFinancingPartnersString()},
                subject to credit approval. ASPS says most health insurance
                plans don&apos;t cover a tummy tuck.
            </p>
            <ModulePriceActions />
        </AnswerBlock>
    )
}

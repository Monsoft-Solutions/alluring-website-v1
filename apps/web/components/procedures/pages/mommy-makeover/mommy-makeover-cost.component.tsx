import Link from 'next/link'
import { Check } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'

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
import { mommyMakeoverFigure } from '@/lib/data/procedures/facts/mommy-makeover.facts'
import { getFinancingPartnersString } from '@/lib/data/site-config'
import type { ProcedurePricing } from '@/lib/types/procedure.type'

import { MommyMakeoverAnchor } from './mommy-makeover-anchor.component'
import { planExamples } from './mommy-makeover-page.constant'

/**
 * What ASPS says the costs of a mommy makeover may include, for any quote to
 * spell out, ours too. What Alluring's prices include waits on the owner, so
 * this claims nothing about ours; `pricing.includes` fills the kit's list the
 * day the owner confirms it.
 */
const quoteLines = [
    "The surgeon's fee",
    'The hospital or surgical facility',
    'Anesthesia',
    'Prescriptions for medication',
    'Implants, if your plan has them',
    'Post-surgery garments',
    'Medical tests and x-rays',
]

/**
 * "How much does a mommy makeover cost in Miami?" Keeps `id="pricing"`, the
 * link other pages and the consultation page use, and the jump nav's "Cost".
 *
 * The practice's price sheet has no mommy makeover line, so the section is the
 * parts: three tables by body area from `procedure.pricing.options` (the same
 * list gives the graph one named `Offer` per part), then the combination rule.
 * No total, no "from" price for a plan and no worked example, which waits on
 * the owner; `planExamples` renders a fourth table the day it has rows.
 */
export function MommyMakeoverCost({ pricing }: { pricing: ProcedurePricing }) {
    const options = pricing.options ?? []

    return (
        <div>
            <MommyMakeoverAnchor id='how-much-does-a-mommy-makeover-cost' />
            <AnswerBlock
                id='pricing'
                question='How much does a mommy makeover cost in Miami?'
                className={moduleSectionPad}
                answer={`At Alluring in Miami, a mommy makeover is priced part by part: a mini tummy tuck from ${mommyMakeoverFigure('price-mini-tummy-tuck')} or a full one from ${mommyMakeoverFigure('price-full-tummy-tuck')}, breast augmentation from ${mommyMakeoverFigure('price-augmentation-saline')}, a breast lift from ${mommyMakeoverFigure('price-lift')} and Lipo 360 from ${mommyMakeoverFigure('price-lipo-360')}. Combining two procedures takes ${mommyMakeoverFigure('price-combination-discount')} off the total, and three take ${mommyMakeoverFigure('price-combination-discount', 1)} off. Your surgeon confirms your price after an exam.`}
            >
                <ModulePriceTable
                    options={options.filter((option) =>
                        /tummy tuck/i.test(option.label)
                    )}
                    heading='Your abdomen: which tummy tuck'
                    id='mommy-makeover-abdomen-prices'
                    optionLabel='Part'
                />
                <ModulePriceTable
                    options={options.filter((option) =>
                        /^breast/i.test(option.label)
                    )}
                    heading='Your breasts: which procedure'
                    id='mommy-makeover-breast-prices'
                    optionLabel='Part'
                />
                <ModulePriceTable
                    options={options.filter((option) =>
                        /lipo/i.test(option.label)
                    )}
                    heading='Your body: liposuction, if your plan has it'
                    id='mommy-makeover-body-prices'
                    optionLabel='Part'
                    note='List prices from our price sheet. Each price is set for you after an exam, and prices are estimates and may change.'
                />
                <ModulePriceTable
                    options={planExamples}
                    heading='Example plans'
                    id='mommy-makeover-plan-examples'
                    optionLabel='Plan'
                />

                <h3 className={cn(moduleH3, 'mt-10 md:mt-11')}>
                    What about the total?
                </h3>
                <p className={cn(moduleBody, 'mt-3.5')}>
                    We don&apos;t publish one mommy makeover price, because the
                    total depends on the parts you and your surgeon settle on.
                    Combining two procedures takes{' '}
                    {mommyMakeoverFigure('price-combination-discount')} off the
                    total, and three take{' '}
                    {mommyMakeoverFigure('price-combination-discount', 1)} off.{' '}
                    Your surgeon confirms your total, and how that applies to
                    your plan, at your consultation.
                </p>
                <p className={cn(moduleBody, 'mt-4')}>
                    What each part involves is on its own page:{' '}
                    <Link
                        href='/procedures/tummy-tuck-miami'
                        className={moduleLink}
                    >
                        tummy tuck
                    </Link>
                    ,{' '}
                    <Link
                        href='/procedures/breast-augmentation-miami'
                        className={moduleLink}
                    >
                        breast augmentation
                    </Link>
                    ,{' '}
                    <Link
                        href='/procedures/breast-lift-miami'
                        className={moduleLink}
                    >
                        breast lift
                    </Link>{' '}
                    and{' '}
                    <Link
                        href='/procedures/liposuction-miami'
                        className={moduleLink}
                    >
                        liposuction
                    </Link>
                    .
                </p>

                <div className='border-gold-400 mt-10 max-w-[41.25rem] border-l-[3px] bg-stone-50 px-5 py-4.5 md:mt-11 md:px-6 md:py-5'>
                    <h3 className='text-[0.9375rem] leading-[1.45] font-bold text-stone-900'>
                        For comparison
                    </h3>
                    <p className='mt-1.5 text-[1.0625rem] leading-[1.6] text-stone-700 tabular-nums md:text-base'>
                        The American Society of Plastic Surgeons publishes no
                        average for a mommy makeover: it says the cost varies
                        with the surgeries chosen. It puts the average cost of a
                        tummy tuck at{' '}
                        {mommyMakeoverFigure('asps-average-fee-tummy-tuck')},
                        breast augmentation with implants at{' '}
                        {mommyMakeoverFigure('asps-average-fee-augmentation')}{' '}
                        and a breast lift at{' '}
                        {mommyMakeoverFigure('asps-average-fee-lift')}, each a
                        surgeon&apos;s fee that does not include anesthesia,
                        operating room facilities or other related expenses. Ask
                        what any quote, ours included, leaves out.{' '}
                        <a
                            href={`#${sourceAnchorId('asps-mommy-makeover-cost')}`}
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
                            ASPS lists these as what the cost may include. Ask
                            for every line in writing, from us and from any
                            clinic you compare. Travel and your stay in Miami
                            are not included; if you are flying in, you arrange
                            them yourself.
                        </p>
                    </>
                )}

                <ModulePriceFactors
                    factors={pricing.factors}
                    heading='What moves your price'
                />

                <h3 className={cn(moduleH3, 'mt-10 md:mt-11')}>
                    Why some mommy makeover offers cost less
                </h3>
                <p className={cn(moduleBody, 'mt-3.5')}>
                    A low advertised price may cover fewer parts, or a mini
                    tummy tuck, which treats only the skin below the belly
                    button and, on our price list, doesn&apos;t repair the
                    muscles. Some offers also leave out anesthesia, the
                    facility, the garment or follow-up visits, or run as a
                    special that ends this week. Compare itemized quotes for the
                    same parts, and ask who performs the surgery and where.
                </p>

                <h3 className={cn(moduleH3, 'mt-10 md:mt-11')}>
                    Does insurance cover a mommy makeover?
                </h3>
                <p className={cn(moduleBody, 'mt-3.5')}>
                    Usually not. ASPS says most health insurance plans do not
                    cover tummy tuck or breast lift surgery or their
                    complications, and will not cover cosmetic breast
                    augmentation. Ask your insurer about your own plan.
                </p>
                <p className={cn(moduleBody, 'mt-4')}>
                    Financing is available through{' '}
                    {getFinancingPartnersString()}, subject to credit approval.
                </p>
                <ModulePriceActions />
            </AnswerBlock>
        </div>
    )
}

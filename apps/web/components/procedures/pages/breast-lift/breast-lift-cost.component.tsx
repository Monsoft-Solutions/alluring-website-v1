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
import { breastLiftFigure } from '@/lib/data/procedures/facts/breast-lift.facts'
import { getFinancingPartnersString } from '@/lib/data/site-config'
import type { ProcedurePricing } from '@/lib/types/procedure.type'

/** What any itemized breast lift quote should spell out, ours included. */
const quoteLines = [
    'Which lift, and whether it includes implants',
    'The implants, if any: saline or silicone',
    "The surgeon's fee",
    'Anesthesia, and who gives it',
    'The surgical facility',
    'Your support bra and follow-up visits',
]

/**
 * "How much is a breast lift in Miami?" Keeps `id="pricing"`: blog posts and
 * other pages link to it, and the jump nav's "Cost" does too.
 *
 * Price depends on whether she needs implants, so the section is the page's
 * chooser as well: the four prices from `procedure.pricing.options` (the
 * site's one breast lift price table, set from the practice's price sheet
 * of 2026-09-15), then a lift alone and a lift with implants side by side.
 * The modified lift stays in the price table only: the sheet says what it
 * removes, and which incision each price covers is an owner question, so
 * no technique is tied to a price anywhere on the page.
 *
 * What the price includes still waits on the owner, so the section claims
 * no inclusion: it lists what any quote should spell out and asks readers
 * to get ours itemized too. `pricing.includes` fills the kit's list the day
 * the owner confirms it.
 *
 * The ASPS national average makes the price concrete without "affordable".
 * It leaves out anesthesia and the facility, so the comparison always says what it leaves
 * out.
 */
export function BreastLiftCost({ pricing }: { pricing: ProcedurePricing }) {
    return (
        <AnswerBlock
            id='pricing'
            question='How much is a breast lift in Miami?'
            className={moduleSectionPad}
            answer={`At Alluring, a breast lift is ${breastLiftFigure('price-lift')} without implants, ${breastLiftFigure('price-lift-saline')} with saline implants and ${breastLiftFigure('price-lift-silicone')} with silicone implants. A modified lift, which removes skin from below the areola only, is ${breastLiftFigure('price-modified')}. Which one fits depends on how far your breasts have dropped and whether you want more fullness, and your surgeon confirms your price at your consultation, after an exam.`}
        >
            <ModulePriceTable
                options={pricing.options ?? []}
                heading='Prices by type of breast lift'
                id='breast-lift-prices'
                optionLabel='Type'
                priceLabel='Price'
                note='List prices from our price sheet. Prices are estimates and may change.'
            />

            <h3 className={cn(moduleH3, 'mt-10 md:mt-11')}>
                Breast lift with or without implants: which do you need?
            </h3>
            <p className={cn(moduleBody, 'mt-3')}>
                It comes down to whether you also want more fullness. Read more
                about{' '}
                <Link
                    href='/blog/breast-lift-implants-miami'
                    className={moduleLink}
                >
                    a breast lift with implants
                </Link>{' '}
                and{' '}
                <Link
                    href='/blog/breast-lift-without-implants'
                    className={moduleLink}
                >
                    a breast lift without implants
                </Link>
                .
            </p>
            <ModuleComparison
                caption='A lift alone, or a lift with implants?'
                columns={[
                    { key: 'lift', label: 'Lift alone' },
                    { key: 'implants', label: 'Lift with implants' },
                ]}
                rows={[
                    {
                        label: 'What it changes',
                        cells: [
                            'Raises the breast and the nipple, and tightens and reshapes it with your own tissue',
                            'Does the same, and adds fullness to the upper part of the breast',
                        ],
                    },
                    {
                        label: 'Your size',
                        cells: [
                            "About the same: a lift alone doesn't change your size",
                            'Larger, by the size of the implant you choose',
                        ],
                    },
                    {
                        label: 'May suit you if',
                        cells: [
                            'You like your size and want it higher and firmer',
                            'Your breasts have dropped and also lost volume, often after nursing or weight loss',
                        ],
                    },
                    {
                        label: 'Implant rules',
                        cells: [
                            'None',
                            `The FDA approves saline implants from ${breastLiftFigure('fda-ages')} and silicone implants from ${breastLiftFigure('fda-ages', 1)}, and says implants are not lifetime devices`,
                        ],
                    },
                ]}
                note={
                    <>
                        What each changes from ASPS and Cleveland Clinic; the
                        implant rules from the FDA. ASPS says implants can go in
                        during the lift or in a second surgery, depending on the
                        surgeon. Yours tells you at your exam which fits you.
                    </>
                }
            />
            <p className={cn(moduleBody, 'mt-5')}>
                Want fuller breasts but they haven&apos;t dropped? Implants
                alone may be enough:{' '}
                <Link
                    href='/procedures/breast-augmentation-miami'
                    className={moduleLink}
                >
                    breast augmentation in Miami
                </Link>
                .
            </p>

            <div className='border-gold-400 mt-10 max-w-[41.25rem] border-l-[3px] bg-stone-50 px-5 py-4.5 md:mt-11 md:px-6 md:py-5'>
                <h3 className='text-[0.9375rem] leading-[1.45] font-bold text-stone-900'>
                    For comparison
                </h3>
                <p className='mt-1.5 text-[1.0625rem] leading-[1.6] text-stone-700 tabular-nums md:text-base'>
                    The American Society of Plastic Surgeons puts the average
                    cost of a breast lift at{' '}
                    {breastLiftFigure('asps-average-fee')}, which does not
                    include anesthesia, operating room facilities or other
                    related expenses. Ask what any quote, ours included, leaves
                    out.{' '}
                    <a
                        href={`#${sourceAnchorId('asps-breast-lift-cost')}`}
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
                Why some breast lift offers cost less
            </h3>
            <p className={cn(moduleBody, 'mt-3.5')}>
                A low advertised breast lift price may be for a smaller lift
                than you need, or for a lift without the implants you want. Some
                offers also leave out anesthesia, the facility or follow-up
                visits, or run as a special that ends this week. Compare
                itemized quotes for the same lift, with or without the same
                implants, and ask who performs the surgery and where. For a
                line-by-line guide, see{' '}
                <Link href='/blog/breast-lift-cost' className={moduleLink}>
                    what a breast lift costs and what a quote should list
                </Link>
                .
            </p>
            <p className={cn(moduleBody, 'mt-5')}>
                Financing is available through {getFinancingPartnersString()}{' '}
                for qualified applicants. ASPS says most health insurance plans
                don&apos;t cover a breast lift.
            </p>
            <ModulePriceActions />
        </AnswerBlock>
    )
}

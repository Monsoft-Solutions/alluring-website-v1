import { Check } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'

import {
    ModulePriceActions,
    ModulePriceFactors,
    ModulePriceIncludes,
} from '@/components/procedures/module-kit/module-price.component'
import {
    moduleBody,
    moduleH3,
    moduleSectionPad,
} from '@/components/procedures/module-kit/module-ui.constant'
import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'
import { sourceAnchorId } from '@/components/procedures/sections/sources-list.component'
import { lipoFigure } from '@/lib/data/procedures/facts/lipo.facts'
import { getFinancingPartnersString } from '@/lib/data/site-config'
import type { ProcedurePricing } from '@/lib/types/procedure.type'

/** What any itemized liposuction quote should spell out, ours included. */
const quoteLines = [
    "The surgeon's fee, and which areas it covers",
    'Anesthesia, and who gives it',
    'The surgical facility',
    'Your compression garment',
    'Follow-up visits after surgery',
]

/**
 * "How much does liposuction cost in Miami?" Keeps `id="pricing"`: blog
 * posts and other pages link to it, and the jump nav's "Cost" does too.
 *
 * The price, the add-on prices and what moves them come from
 * `procedure.pricing`, the site's one liposuction price table, set from the
 * practice's price sheet of 2026-09-15. What the price includes still waits
 * on the owner, so the section doesn't claim any inclusion: it lists what
 * any quote should spell out and asks readers to get ours itemized too.
 * `pricing.includes` fills the kit's list the day the owner confirms it.
 *
 * The ASPS national average makes "affordable" concrete without the word.
 * It is a surgeon's fee only, so the comparison always says what it leaves
 * out.
 */
export function LipoCost({ pricing }: { pricing: ProcedurePricing }) {
    return (
        <AnswerBlock
            id='pricing'
            question='How much does liposuction cost in Miami?'
            className={moduleSectionPad}
            answer={`At Alluring, Lipo 360 starts at ${lipoFigure('price-starting-at')}, and liposuction of one area added to another procedure is ${lipoFigure('price-added-area')}, depending on the area. Your price is set for you after an exam, because it depends on how many areas are treated and what else is done. Price ranges are estimates and may change.`}
        >
            <div className='border-gold-400 mt-8 max-w-[41.25rem] border-l-[3px] bg-stone-50 px-5 py-4.5 md:px-6 md:py-5'>
                <h3 className='text-[0.9375rem] leading-[1.45] font-bold text-stone-900'>
                    For comparison
                </h3>
                <p className='mt-1.5 text-[1.0625rem] leading-[1.6] text-stone-700 tabular-nums md:text-base'>
                    The American Society of Plastic Surgeons puts the average
                    cost of liposuction at {lipoFigure('asps-average-fee')}, a
                    surgeon&apos;s fee that does not include anesthesia,
                    operating room facilities or other related expenses. Ask
                    what any quote, ours included, leaves out.{' '}
                    <a
                        href={`#${sourceAnchorId('asps-liposuction-cost')}`}
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
                Why some liposuction offers cost less
            </h3>
            <p className={cn(moduleBody, 'mt-3.5')}>
                Some advertised liposuction prices leave out anesthesia, the
                facility, the compression garment or follow-up visits, price a
                single area as if it were the whole midsection, or run as a
                special that ends this week. Compare itemized quotes, and ask
                who performs the surgery, where it takes place and how much fat
                is planned for each area.
            </p>
            <p className={cn(moduleBody, 'mt-5')}>
                Financing is available through {getFinancingPartnersString()},
                subject to credit approval. Insurance generally does not cover
                liposuction done for cosmetic reasons.
            </p>
            <ModulePriceActions />
        </AnswerBlock>
    )
}

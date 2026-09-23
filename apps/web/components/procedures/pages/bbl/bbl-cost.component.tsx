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
import { bblFigure } from '@/lib/data/procedures/facts/bbl.facts'
import { getFinancingPartnersString } from '@/lib/data/site-config'
import type { ProcedurePricing } from '@/lib/types/procedure.type'

/**
 * "How much is a BBL in Miami?" Keeps `id="pricing"`: body copy, blog posts
 * and the price table link to it.
 *
 * What the price includes and what moves it come from `procedure.pricing`,
 * the site's one BBL price table, so this section and every other reader of
 * it say the same thing.
 *
 * The ASPS national average makes "affordable" concrete without the word,
 * and gives AI answers a sourced figure to set beside ours. It is a surgeon's
 * fee only, so the comparison always says what it leaves out.
 */
export function BblCost({ pricing }: { pricing: ProcedurePricing }) {
    return (
        <AnswerBlock
            id='pricing'
            question='How much is a BBL in Miami?'
            className={moduleSectionPad}
            answer={`A BBL at Alluring starts at ${bblFigure('price-starting-at')}, and most patients pay between $5,500 and $10,000. Your price is set for you after an exam, because it depends on how much fat is moved, how many areas are treated and what else is done. Price ranges are estimates and may change.`}
        >
            <div className='border-gold-400 mt-8 max-w-[41.25rem] border-l-[3px] bg-stone-50 px-5 py-4.5 md:px-6 md:py-5'>
                <h3 className='text-[0.9375rem] leading-[1.45] font-bold text-stone-900'>
                    For comparison
                </h3>
                <p className='mt-1.5 text-[1.0625rem] leading-[1.6] text-stone-700 tabular-nums md:text-base'>
                    The American Society of Plastic Surgeons puts the average
                    cost of a BBL at {bblFigure('asps-average-cost')}, a figure
                    that does not include anesthesia, operating room facilities
                    or other related expenses. Alluring&apos;s price includes
                    the surgeon&apos;s fee, anesthesia and the surgical
                    facility.{' '}
                    <a
                        href={`#${sourceAnchorId('asps-bbl-cost')}`}
                        className='text-sm whitespace-nowrap text-stone-500 underline decoration-stone-300 underline-offset-4 hover:text-stone-900'
                    >
                        Source
                    </a>
                </p>
            </div>

            <ModulePriceIncludes includes={pricing.includes} />
            <ModulePriceFactors
                factors={pricing.factors}
                note='Skinny BBLs and revisions are priced the same way, after an exam.'
            />

            <h3 className={cn(moduleH3, 'mt-10 md:mt-11')}>
                Why some BBL offers cost less
            </h3>
            <p className={cn(moduleBody, 'mt-3.5')}>
                Some advertised BBL prices leave out anesthesia, the facility,
                garments or follow-up visits, or describe a smaller procedure
                than the one you want. Ask every clinic, including us, for an
                itemized quote. Then ask whether the surgeon places the fat
                under ultrasound guidance and stays with one patient for the
                whole surgery, as Florida law requires.
            </p>
            <p className={cn(moduleBody, 'mt-5')}>
                Financing is available through {getFinancingPartnersString()},
                subject to credit approval. Insurance does not cover a BBL,
                because it is a cosmetic procedure.
            </p>
            <ModulePriceActions />
        </AnswerBlock>
    )
}

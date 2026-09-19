import { Check } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'

import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'
import { bblFigure } from '@/lib/data/procedures/facts/bbl.facts'
import { getFinancingPartnersString } from '@/lib/data/site-config'
import type { ProcedurePricing } from '@/lib/types/procedure.type'

import { bblBody, bblH3, bblSectionPad } from './bbl-ui.constant'

/**
 * "How much is a BBL in Miami?" Keeps `id="pricing"`: body copy, blog posts
 * and the price table link to it.
 *
 * What the price includes and what moves it come from `procedure.pricing`,
 * the site's one BBL price table, so this section and every other reader of
 * it say the same thing.
 */
export function BblCost({ pricing }: { pricing: ProcedurePricing }) {
    return (
        <AnswerBlock
            id='pricing'
            question='How much is a BBL in Miami?'
            className={bblSectionPad}
            answer={`A BBL at Alluring starts at ${bblFigure('price-starting-at')}, and most patients pay between $5,500 and $10,000. Your price is set for you after an exam, because it depends on how much fat is moved, how many areas are treated and what else is done. Price ranges are estimates and may change.`}
        >
            {pricing.includes && pricing.includes.length > 0 && (
                <>
                    <h3 className={cn(bblH3, 'mt-10 md:mt-11')}>
                        What the price includes
                    </h3>
                    <ul className='mt-4 grid gap-3 md:grid-cols-2 md:gap-x-8 md:gap-y-3.5'>
                        {pricing.includes.map((item) => (
                            <li
                                key={item}
                                className='flex gap-3 text-[1.0625rem] leading-normal text-stone-900'
                            >
                                <Check
                                    aria-hidden='true'
                                    strokeWidth={2}
                                    className='text-gold-600 mt-0.5 size-5 shrink-0'
                                />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                    <p className='mt-4 max-w-[41.25rem] text-[0.9375rem] leading-[1.55] text-stone-600 md:text-base md:leading-[1.6]'>
                        Travel and your stay in Miami are not included. If you
                        are flying in, you arrange them yourself.
                    </p>
                </>
            )}

            {pricing.factors && pricing.factors.length > 0 && (
                <>
                    <h3 className={cn(bblH3, 'mt-10 md:mt-11')}>
                        What moves your price within the range
                    </h3>
                    <dl className='mt-4 grid gap-4.5 md:grid-cols-2 md:gap-x-8 md:gap-y-6'>
                        {pricing.factors.map((factor) => (
                            <div
                                key={factor.label}
                                className='border-t border-stone-200 pt-3.5'
                            >
                                <dt className='text-[1.0625rem] leading-[1.45] font-bold text-stone-900'>
                                    {factor.label}
                                </dt>
                                <dd className='mt-1.5 text-[1.0625rem] leading-[1.6] text-stone-700 md:text-base'>
                                    {factor.description}
                                </dd>
                            </div>
                        ))}
                    </dl>
                    <p className='mt-5 text-[1.0625rem] leading-[1.6] text-stone-700 md:text-base'>
                        Skinny BBLs and revisions are priced the same way, after
                        an exam.
                    </p>
                </>
            )}

            <h3 className={cn(bblH3, 'mt-10 md:mt-11')}>
                Why some BBL offers cost less
            </h3>
            <p className={cn(bblBody, 'mt-3.5')}>
                Some advertised BBL prices leave out anesthesia, the facility,
                garments or follow-up visits, or describe a smaller procedure
                than the one you want. Ask every clinic, including us, for an
                itemized quote. Then ask whether the surgeon places the fat
                under ultrasound guidance and stays with one patient for the
                whole surgery, as Florida law requires.
            </p>
            <p className={cn(bblBody, 'mt-5')}>
                Financing is available through {getFinancingPartnersString()},
                subject to credit approval. Insurance does not cover a BBL,
                because it is a cosmetic procedure.
            </p>
            <p className='mt-7 max-w-[41.25rem] border-t border-stone-200 pt-5 text-[1.0625rem] leading-[1.55] font-bold text-stone-900 md:text-lg'>
                Your surgeon confirms your exact price at your consultation,
                before you commit to anything.
            </p>
        </AnswerBlock>
    )
}

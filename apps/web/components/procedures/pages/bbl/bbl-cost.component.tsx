import Link from 'next/link'
import { Check } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'

import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'
import { sourceAnchorId } from '@/components/procedures/sections/sources-list.component'
import { bblFigure } from '@/lib/data/procedures/facts/bbl.facts'
import { getFinancingPartnersString } from '@/lib/data/site-config'
import type { ProcedurePricing } from '@/lib/types/procedure.type'

import {
    bblBody,
    bblButtonPrimary,
    bblH3,
    bblLink,
    bblSectionPad,
} from './bbl-ui.constant'

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
            className={bblSectionPad}
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
            <ul className='mt-4 flex flex-wrap gap-x-7 gap-y-1'>
                <li>
                    <Link
                        href='/plastic-surgery-financing-miami'
                        className={cn(
                            bblLink,
                            'inline-flex min-h-11 items-center text-base font-bold'
                        )}
                    >
                        See financing options
                    </Link>
                </li>
                <li>
                    <Link
                        href='/miami-plastic-surgery-specials'
                        className={cn(
                            bblLink,
                            'inline-flex min-h-11 items-center text-base font-bold'
                        )}
                    >
                        Current offers
                    </Link>
                </li>
            </ul>
            <div className='mt-7 max-w-[41.25rem] border-t border-stone-200 pt-5'>
                <p className='text-[1.0625rem] leading-[1.55] font-bold text-stone-900 md:text-lg'>
                    Your surgeon confirms your exact price at your consultation,
                    before you commit to anything.
                </p>
                <a href='#book' className={cn(bblButtonPrimary, 'mt-5')}>
                    Get your exact price
                </a>
            </div>
        </AnswerBlock>
    )
}

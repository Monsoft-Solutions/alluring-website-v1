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
import { breastAugmentationFigure as figure } from '@/lib/data/procedures/facts/breast-augmentation.facts'
import { getFinancingPartnersString } from '@/lib/data/site-config'
import type { ProcedurePricing } from '@/lib/types/procedure.type'

/** What any itemized breast augmentation quote should spell out, ours included. */
const quoteLines = [
    'Which implant: saline or silicone, and its maker',
    'Whether the implants are in the price',
    "The surgeon's fee",
    'Anesthesia, and who gives it',
    'The surgical facility',
    'Your surgical bra and follow-up visits',
]

/**
 * "How much is breast augmentation in Miami?" Keeps `id="pricing"`: blog
 * posts and other pages link to it, and so does the retired
 * `/breast-augmentation-cost-miami` (D6 of the wave-two brief).
 *
 * Two prices from `procedure.pricing.options` (the site's one breast
 * augmentation price table, set from the practice's price sheet of
 * 2026-09-15), each an `Offer` of its own in the page graph. This page owns
 * augmentation only: implants with a lift are a breast lift, priced on that
 * page, so the section points there instead of quoting it.
 *
 * What the price includes, the implants among it, still waits on the owner,
 * so the section claims no inclusion: it lists what any quote should spell
 * out. `pricing.includes` fills the kit's list the day the owner confirms
 * it. The ASPS national average makes the price concrete without the word
 * "affordable", and the answer always says what it leaves out.
 */
export function BreastAugmentationCost({
    pricing,
}: {
    pricing: ProcedurePricing
}) {
    return (
        <AnswerBlock
            id='pricing'
            question='How much is breast augmentation in Miami?'
            className={moduleSectionPad}
            answer={`At Alluring, breast augmentation is ${figure('price-saline')} with saline implants and ${figure('price-silicone')} with silicone implants, from our price list. Your surgeon confirms your price at your consultation, after an exam. For comparison, ASPS puts the national average surgeon's fee at ${figure('asps-average-fee')}, before anesthesia and the operating room, so ask what every quote includes.`}
        >
            <ModulePriceTable
                options={pricing.options ?? []}
                heading='Prices by implant'
                id='breast-augmentation-prices'
                optionLabel='Implant'
                priceLabel='Price'
                note={
                    <>
                        List prices from our price sheet. Prices are estimates
                        and may change. Implants with a lift are a breast lift,
                        a different procedure with its own price:{' '}
                        <Link
                            href='/procedures/breast-lift-miami'
                            className={moduleLink}
                        >
                            breast lift in Miami
                        </Link>
                        .
                    </>
                }
            />

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
                Why some breast augmentation offers cost less
            </h3>
            <p className={cn(moduleBody, 'mt-3.5')}>
                Advertised prices in Miami can start lower than ours. A low
                price may be for saline implants only, or leave out the
                implants, the anesthesia, the facility or follow-up visits, or
                run as a special that ends this week. Compare itemized quotes
                for the same implant, and ask who performs the surgery and
                where.
            </p>
            <p className={cn(moduleBody, 'mt-5')}>
                Financing is available through {getFinancingPartnersString()}{' '}
                for qualified applicants. ASPS says most health insurance plans
                won&apos;t cover cosmetic breast augmentation.
            </p>
            <ModulePriceActions />
        </AnswerBlock>
    )
}

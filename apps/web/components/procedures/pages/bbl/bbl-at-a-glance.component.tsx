import { moduleSectionPad } from '@/components/procedures/module-kit/module-ui.constant'
import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'
import { DiscountStatement } from '@/components/shared/discount-statement.component'
import {
    FactTable,
    type Fact,
} from '@/components/procedures/sections/fact-table.component'
import {
    PriceRangeFigures,
    PriceTag,
} from '@/components/shared/price-tag.component'
import { KARLINSKY_NAME } from '@/lib/data/surgeons/karlinsky-credentials.constant'
import type { ProcedurePrices } from '@/lib/claims/procedure-prices.util'

/**
 * "What is a BBL?" and the at-a-glance table: every figure a reader
 * scans for, as label → value rows. Each figure is declared in
 * `bbl.facts.ts`; the copy sweep fails the build output if one drifts.
 *
 * No photograph: the #254 consultation render was scroll with no
 * information and a "Model shown" label. A real photo of the surgeon with a
 * patient belongs here when the practice has one.
 */
export function BblAtAGlance({ prices }: { prices: ProcedurePrices }) {
    // The two price rows read the pricing resolver (#354); a figure it
    // can't publish drops its row rather than showing a typed one.
    const priceFacts: Fact[] = [
        ...(prices.starting
            ? [
                  {
                      label: 'Starting price',
                      value: (
                          <>
                              Starting at <PriceTag price={prices.starting} />
                          </>
                      ),
                  },
              ]
            : []),
        ...(prices.range
            ? [
                  {
                      label: 'Most patients',
                      value: (
                          <>
                              <PriceRangeFigures range={prices.range} />, set
                              for each patient
                          </>
                      ),
                  },
              ]
            : []),
    ]
    const facts: Fact[] = [
        ...priceFacts,
        { label: 'Surgery time', value: '3 to 5 hours' },
        {
            label: 'Anesthesia and setting',
            value: 'General anesthesia; outpatient, so you go home the same day',
        },
        { label: 'Your surgeon', value: KARLINSKY_NAME },
        {
            label: 'Florida standard',
            value: 'Fat under the skin only, placed with ultrasound guidance, one surgeon for one patient',
        },
        {
            label: 'Back to a desk job',
            value: '10 to 14 days, sitting on a pillow (Cleveland Clinic, The Aesthetic Society); ASPS says some go back at 7 to 10',
        },
        {
            label: 'Sitting',
            value: 'Not on your buttocks for 2 weeks; on a BBL pillow until about week 8 (Cleveland Clinic)',
        },
        {
            label: 'Exercise',
            value: 'Walking from day 1 or 2; normal exercise at about 8 weeks (The Aesthetic Society)',
        },
        {
            label: 'Flying in from another state',
            value: 'Plan on 7 to 10 days in Miami',
        },
        { label: 'Final shape', value: '3 to 6 months after surgery' },
    ]

    return (
        <AnswerBlock
            id='what-is-a-bbl'
            question='What is a BBL?'
            answerClassName='quick-answer'
            className={moduleSectionPad}
            answer='A Brazilian butt lift (BBL) is a fat transfer to the buttocks. A surgeon uses liposuction to remove fat from areas such as the abdomen, flanks or back, processes it, and injects it under the skin of the buttocks to add volume and shape. Because it uses your own fat, there is no implant.'
        >
            <FactTable
                caption='BBL at Alluring, at a glance'
                facts={facts}
                className='mt-10 md:mt-11'
            />
            {/* The table prints the price, so a discount's 456.062
                statement sits right under it (#354). */}
            <DiscountStatement
                statement={prices.discountStatement}
                className='mt-4'
            />
        </AnswerBlock>
    )
}

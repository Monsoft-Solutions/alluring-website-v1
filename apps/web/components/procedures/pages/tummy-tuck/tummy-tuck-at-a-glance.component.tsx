import { moduleSectionPad } from '@/components/procedures/module-kit/module-ui.constant'
import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'
import { DiscountStatement } from '@/components/shared/discount-statement.component'
import {
    FactTable,
    type Fact,
} from '@/components/procedures/sections/fact-table.component'
import { PriceTag } from '@/components/shared/price-tag.component'
import { findLinePrice } from '@/lib/claims/procedure-prices.util'
import { tummyTuckFigure } from '@/lib/data/procedures/facts/tummy-tuck.facts'
import { KARLINSKY_NAME } from '@/lib/data/surgeons/karlinsky-credentials.constant'
import type { ProcedurePrices } from '@/lib/claims/procedure-prices.util'

/**
 * "What is a tummy tuck?" and the at-a-glance table: every figure a reader
 * scans for, as label → value rows. Each figure is declared in
 * `tummy-tuck.facts.ts`; the copy sweep fails the build output if one
 * drifts.
 *
 * The answer is the site's one definition of a tummy tuck: `quickAnswer` in
 * the data file says the same thing. It follows the price on this page,
 * because the hero has already said what a tummy tuck does and the price by
 * type is what she came to find.
 */
export function TummyTuckAtAGlance({ prices }: { prices: ProcedurePrices }) {
    // The price row reads the pricing resolver (#354).
    const mini = findLinePrice(prices, 'mini')
    const full = findLinePrice(prices, 'full')
    const facts: Fact[] = [
        ...(mini && full
            ? [
                  {
                      label: 'Prices',
                      value: (
                          <>
                              Mini tummy tuck from <PriceTag price={mini} />;
                              full tummy tuck from <PriceTag price={full} />
                          </>
                      ),
                  },
              ]
            : []),
        { label: 'Your surgeon', value: KARLINSKY_NAME },
        {
            label: 'Surgery time',
            value: `${tummyTuckFigure('surgery-1-5-hours')}, depending on the type (Cleveland Clinic)`,
        },
        {
            label: 'Anesthesia and setting',
            value: 'General anesthesia; usually outpatient, so you go home the same day with someone to stay with you',
        },
        {
            label: 'Standing up straight',
            value: `After ${tummyTuckFigure('bent-7-10-days')} of walking bent at the waist (Cindy Wu, MD, on the ASPS website)`,
        },
        {
            label: 'Back to a desk job',
            value: `About ${tummyTuckFigure('work-about-2-weeks')} (Cindy Wu, MD, on the ASPS website); plan at least ${tummyTuckFigure('work-about-2-weeks', 1)} off (Cleveland Clinic)`,
        },
        {
            label: 'Compression garment',
            value: `${tummyTuckFigure('garment-4-6-weeks')}`,
        },
        {
            label: 'Heavy lifting and strenuous exercise',
            value: `Usually after ${tummyTuckFigure('heavy-lifting-4-8-weeks')}`,
        },
        {
            label: 'Final result',
            value: `Up to ${tummyTuckFigure('results-3-months')} (Cleveland Clinic); the scar fades over ${tummyTuckFigure('scar-fades-12-18-months')} (Cindy Wu, MD)`,
        },
        {
            label: 'Florida office limit',
            value: `${tummyTuckFigure('florida-lipo-with-tummy-tuck-1000cc')} of liposuction with a tummy tuck`,
        },
    ]

    return (
        <AnswerBlock
            id='what-is-a-tummy-tuck'
            question='What is a tummy tuck?'
            answerClassName='quick-answer'
            className={moduleSectionPad}
            answer="A tummy tuck, or abdominoplasty, is surgery that removes loose skin and fat from the abdomen and, in most cases, ASPS says, repairs weakened or separated abdominal muscles. It flattens and firms the abdomen after pregnancy or weight loss. It is not a weight-loss treatment, and it can't correct stretch marks, except those on the skin it removes."
        >
            <FactTable
                caption='Tummy tuck at Alluring, at a glance'
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

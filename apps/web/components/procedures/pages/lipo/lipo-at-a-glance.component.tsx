import { moduleSectionPad } from '@/components/procedures/module-kit/module-ui.constant'
import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'
import { DiscountStatement } from '@/components/shared/discount-statement.component'
import {
    FactTable,
    type Fact,
} from '@/components/procedures/sections/fact-table.component'
import { PriceTag } from '@/components/shared/price-tag.component'
import { formatLineName } from '@workspace/shared/claims/pricing'
import {
    isSingleAreaAddOn,
    linePriceExtremes,
} from '@/lib/claims/procedure-prices.util'
import { lipoFigure } from '@/lib/data/procedures/facts/lipo.facts'
import { KARLINSKY_NAME } from '@/lib/data/surgeons/karlinsky-credentials.constant'
import type { ProcedurePrices } from '@/lib/claims/procedure-prices.util'

/**
 * "What is liposuction?" and the at-a-glance table: every figure a reader
 * scans for, as label → value rows. Each figure is declared in
 * `lipo.facts.ts`; the copy sweep fails the build output if one drifts.
 *
 * The answer is the site's one definition of liposuction: `quickAnswer` in
 * the data file says the same thing.
 */
export function LipoAtAGlance({ prices }: { prices: ProcedurePrices }) {
    // The two price rows read the pricing resolver (#354); a figure it
    // can't publish drops its row rather than showing a typed one.
    const addedArea = linePriceExtremes(prices, isSingleAreaAddOn)
    const priceFacts: Fact[] = [
        ...(prices.starting
            ? [
                  {
                      label: 'Starting price',
                      value: (
                          <>
                              {formatLineName(prices.starting.label, {
                                  capitalized: true,
                              })}{' '}
                              from <PriceTag price={prices.starting} />
                          </>
                      ),
                  },
              ]
            : []),
        ...(addedArea
            ? [
                  {
                      label: 'Added to another procedure',
                      value: (
                          <>
                              <PriceTag price={addedArea.min} /> to{' '}
                              <PriceTag price={addedArea.max} /> per area,
                              depending on the area
                          </>
                      ),
                  },
              ]
            : []),
    ]
    const facts: Fact[] = [
        ...priceFacts,
        {
            label: 'Surgery time',
            value: `${lipoFigure('surgery-1-3-hours')}, depending on the areas treated`,
        },
        {
            label: 'Anesthesia and setting',
            value: 'General anesthesia or local anesthesia with sedation; outpatient, so you go home the same day',
        },
        { label: 'Your surgeon', value: KARLINSKY_NAME },
        {
            label: 'Back to work',
            value: 'A few days (The Aesthetic Society) to weeks 2–3 (ASPS), depending on your job',
        },
        {
            label: 'Compression garment',
            value: `${lipoFigure('garment-4-6-weeks')} over the treated areas`,
        },
        {
            label: 'Exercise',
            value: `Walking right away (MedlinePlus); strenuous exercise after ${lipoFigure('exercise-4-6-weeks')} (The Aesthetic Society)`,
        },
        {
            label: 'Final shape',
            value: `${lipoFigure('results-3-6-months')} after surgery`,
        },
        {
            label: 'Florida office limit',
            value: `${lipoFigure('florida-office-limit-4000cc')} of fat in a doctor's office`,
        },
    ]

    return (
        <AnswerBlock
            id='what-is-liposuction'
            question='What is liposuction?'
            answerClassName='quick-answer'
            className={moduleSectionPad}
            answer='Liposuction, sometimes called liposculpture, is surgery that removes fat from a specific area through small incisions, using a thin tube called a cannula. It reshapes areas where fat stays despite diet and exercise, such as the abdomen, flanks, back, arms or thighs. It is not a weight-loss treatment, and it does not tighten skin.'
        >
            <FactTable
                caption='Liposuction at Alluring, at a glance'
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

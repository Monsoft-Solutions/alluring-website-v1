import { moduleSectionPad } from '@/components/procedures/module-kit/module-ui.constant'
import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'
import {
    FactTable,
    type Fact,
} from '@/components/procedures/sections/fact-table.component'
import { breastLiftFigure } from '@/lib/data/procedures/facts/breast-lift.facts'
import { KARLINSKY_NAME } from '@/lib/data/surgeons/karlinsky-credentials.constant'

/**
 * "What is a breast lift?" and the at-a-glance table: every figure a reader
 * scans for, as label → value rows. Each figure is declared in
 * `breast-lift.facts.ts`; the copy sweep fails the build output if one
 * drifts.
 *
 * The answer is the site's one definition of a breast lift: `quickAnswer` in
 * the data file says the same thing. It follows the price on this page,
 * because the hero has already said what a lift does and the price, alone
 * or with implants, is what she came to find.
 */
export function BreastLiftAtAGlance() {
    const facts: Fact[] = [
        {
            label: 'Prices',
            value: `A lift ${breastLiftFigure('price-lift')}; with saline implants ${breastLiftFigure('price-lift-saline')}; with silicone implants ${breastLiftFigure('price-lift-silicone')}; a modified lift ${breastLiftFigure('price-modified')}`,
        },
        { label: 'Your surgeon', value: KARLINSKY_NAME },
        {
            label: 'Surgery time',
            value: `Usually ${breastLiftFigure('surgery-time')} (Cleveland Clinic); your surgeon tells you how long yours takes`,
        },
        {
            label: 'Anesthesia and setting',
            value: 'Usually general anesthesia, and you go home the same day with someone to stay with you',
        },
        {
            label: 'Swelling and bruising',
            value: `About ${breastLiftFigure('swelling-2-weeks')} (Cleveland Clinic)`,
        },
        {
            label: 'Back to a desk job',
            value: 'About a week (Cleveland Clinic)',
        },
        {
            label: 'Lifting, exercise and sex',
            value: `Once your surgeon clears them, which can take up to ${breastLiftFigure('vigorous-up-to-6-weeks')} (Cleveland Clinic)`,
        },
        {
            label: 'Back to a regular bra',
            value: `About ${breastLiftFigure('regular-bra-8-weeks')} (Cleveland Clinic)`,
        },
        {
            label: 'Final shape and scars',
            value: 'The shape settles over a few months (ASPS); the scars fade most in about a year (Cleveland Clinic)',
        },
        {
            label: 'Florida office limit',
            value: `${breastLiftFigure('florida-8-hours')} of surgery in a doctor's office`,
        },
    ]

    return (
        <AnswerBlock
            id='what-is-a-breast-lift'
            question='What is a breast lift?'
            answerClassName='quick-answer'
            className={moduleSectionPad}
            answer='A breast lift, or mastopexy, raises breasts that have dropped by removing loose skin and tightening the tissue around them, and moves the nipple and areola higher; ASPS says it can make an enlarged areola smaller too. It changes shape and position, not size: for more fullness, it is combined with implants.'
        >
            <FactTable
                caption='Breast lift at Alluring, at a glance'
                facts={facts}
                className='mt-10 md:mt-11'
            />
        </AnswerBlock>
    )
}

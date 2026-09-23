import { moduleSectionPad } from '@/components/procedures/module-kit/module-ui.constant'
import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'
import {
    FactTable,
    type Fact,
} from '@/components/procedures/sections/fact-table.component'
import { bblFigure } from '@/lib/data/procedures/facts/bbl.facts'
import { KARLINSKY_NAME } from '@/lib/data/surgeons/karlinsky-credentials.constant'

/**
 * "What is a BBL?" and the at-a-glance table: every figure a reader
 * scans for, as label → value rows. Each figure is declared in
 * `bbl.facts.ts`; the copy sweep fails the build output if one drifts.
 *
 * No photograph: the #254 consultation render was scroll with no
 * information and a "Model shown" label. A real photo of the surgeon with a
 * patient belongs here when the practice has one.
 */
export function BblAtAGlance() {
    const facts: Fact[] = [
        {
            label: 'Starting price',
            value: `Starting at ${bblFigure('price-starting-at')}`,
        },
        {
            label: 'Most patients',
            value: `${bblFigure('price-most-patients')}, set for each patient`,
        },
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
            value: '10 to 14 days, sitting on a pillow',
        },
        {
            label: 'Sitting',
            value: 'Not on your buttocks for 2 weeks; on a BBL pillow until about week 8',
        },
        {
            label: 'Exercise',
            value: 'Walking from day 1 or 2; normal exercise at about 8 weeks',
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
        </AnswerBlock>
    )
}

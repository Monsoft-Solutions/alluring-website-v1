import { moduleSectionPad } from '@/components/procedures/module-kit/module-ui.constant'
import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'
import {
    FactTable,
    type Fact,
} from '@/components/procedures/sections/fact-table.component'
import { lipoFigure } from '@/lib/data/procedures/facts/lipo.facts'
import { KARLINSKY_NAME } from '@/lib/data/surgeons/karlinsky-credentials.constant'

/**
 * "What is liposuction?" and the at-a-glance table: every figure a reader
 * scans for, as label → value rows. Each figure is declared in
 * `lipo.facts.ts`; the copy sweep fails the build output if one drifts.
 *
 * The answer is the site's one definition of liposuction: `quickAnswer` in
 * the data file says the same thing.
 */
export function LipoAtAGlance() {
    const facts: Fact[] = [
        {
            label: 'Starting price',
            value: `Lipo 360 from ${lipoFigure('price-starting-at')}`,
        },
        {
            label: 'Added to another procedure',
            value: `${lipoFigure('price-added-area')} per area, depending on the area`,
        },
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
            value: `Walking right away; strenuous exercise after ${lipoFigure('exercise-4-6-weeks')}`,
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
        </AnswerBlock>
    )
}

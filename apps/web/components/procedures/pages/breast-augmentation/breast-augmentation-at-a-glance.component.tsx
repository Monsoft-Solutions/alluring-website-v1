import { moduleSectionPad } from '@/components/procedures/module-kit/module-ui.constant'
import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'
import {
    FactTable,
    type Fact,
} from '@/components/procedures/sections/fact-table.component'
import { breastAugmentationFigure as figure } from '@/lib/data/procedures/facts/breast-augmentation.facts'
import { KARLINSKY_NAME } from '@/lib/data/surgeons/karlinsky-credentials.constant'

/**
 * "What is breast augmentation?" and the at-a-glance table: every figure a
 * reader scans for, as label → value rows. Each figure is declared in
 * `breast-augmentation.facts.ts`; the copy sweep fails the build output if
 * one drifts.
 *
 * The answer is the site's one definition of breast augmentation:
 * `quickAnswer` in the data file says the same thing. It follows the price
 * on this page, because the hero has already said what it does and the
 * price is what she came to find.
 */
export function BreastAugmentationAtAGlance() {
    const facts: Fact[] = [
        {
            label: 'Prices',
            value: `From ${figure('price-saline')} with saline implants; from ${figure('price-silicone')} with silicone`,
        },
        { label: 'Your surgeon', value: KARLINSKY_NAME },
        {
            label: 'Anesthesia and length',
            value: 'General anesthesia for most women; one to several hours, the FDA says',
        },
        {
            label: 'Going home',
            value: 'The same day, once you are stable, typically after about an hour (ASPS)',
        },
        {
            label: 'Back to work',
            value: 'A few days to a week, depending on your job (The Aesthetic Society)',
        },
        {
            label: 'Driving',
            value: `Many people can drive after about ${figure('driving-about-a-week', 1)} (${figure('driving-about-a-week')}), an article on the ASPS website says; MedlinePlus says not to drive for at least ${figure('driving-about-a-week', 2)}. Never on opioid pain medicine`,
        },
        {
            label: 'Heavy lifting',
            value: `After at least ${figure('heavy-lifting-4-weeks')} (Cleveland Clinic)`,
        },
        {
            label: 'Full recovery',
            value: `About ${figure('full-recovery-6-8-weeks')} (Cleveland Clinic)`,
        },
        {
            label: 'Final shape',
            value: `University of Utah Health: final results begin to show around ${figure('drop-fluff-3-6-months')}, with subtle changes through ${figure('drop-fluff-3-6-months', 2)}. An article on the ASPS website: drop and fluff can take ${figure('drop-fluff-3-6-months', 1)}`,
        },
        {
            label: 'FDA minimum age',
            value: `For augmentation, ${figure('fda-ages')} or older for saline and ${figure('fda-ages', 1)} or older for silicone`,
        },
        {
            label: 'Screening scans',
            value: `Silicone only: an ultrasound or MRI at ${figure('silicone-screening')}, then every ${figure('silicone-screening', 1)} (FDA)`,
        },
    ]

    return (
        <AnswerBlock
            id='what-is-breast-augmentation'
            question='What is breast augmentation?'
            answerClassName='quick-answer'
            className={moduleSectionPad}
            answer="Breast augmentation, also called a boob job, is surgery that increases the size of the breasts with saline or silicone implants or, sometimes, fat transfer, ASPS says. It can restore volume lost after pregnancy or weight loss and improve uneven breasts. It doesn't correct breasts that sag a lot; that takes a breast lift, sometimes in the same surgery."
        >
            <FactTable
                caption='Breast augmentation at Alluring, at a glance'
                facts={facts}
                className='mt-10 md:mt-11'
            />
        </AnswerBlock>
    )
}

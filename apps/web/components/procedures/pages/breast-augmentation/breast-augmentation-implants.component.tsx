import { cn } from '@workspace/ui/lib/utils'

import { ModuleComparison } from '@/components/procedures/module-kit/module-comparison.component'
import {
    moduleBody,
    moduleH3,
    moduleSectionPad,
} from '@/components/procedures/module-kit/module-ui.constant'
import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'
import { breastAugmentationFigure as figure } from '@/lib/data/procedures/facts/breast-augmentation.facts'

/** "age 18" opens a table cell as "Age 18". */
const capitalize = (text: string) =>
    text.charAt(0).toUpperCase() + text.slice(1)

/**
 * "Saline or silicone: which implant is right for me?" The two implants the
 * practice prices, side by side in the kit's `ModuleComparison`: what fills
 * each, how it feels, what a rupture looks like, the FDA's screening
 * schedule and minimum age, and the price. The screening row is the one no
 * Miami competitor gets right (the wave-two brief's market sweep), so it
 * carries the FDA's own schedule.
 *
 * Which maker's implants Dr. Karlinsky uses, and whether smooth or
 * textured, wait on the owner, so the section never claims either; it
 * tells readers what the surface means and to ask.
 */
export function BreastAugmentationImplants() {
    return (
        <AnswerBlock
            id='implants'
            question='Saline or silicone: which implant is right for me?'
            className={moduleSectionPad}
            answer={`Silicone gel feels a bit more like natural breast tissue, ASPS says, but a silicone rupture is usually silent, so the FDA recommends screening scans. Saline implants cost less, and a rupture shows because the implant deflates. The FDA approves silicone for augmentation from ${figure('fda-ages', 1)} and saline from ${figure('fda-ages')}.`}
        >
            <ModuleComparison
                caption='Saline or silicone, side by side'
                columns={[
                    { key: 'saline', label: 'Saline' },
                    { key: 'silicone', label: 'Silicone' },
                ]}
                rows={[
                    {
                        label: 'What fills it',
                        cells: ['Sterile salt water', 'Silicone gel'],
                    },
                    {
                        label: 'How it feels',
                        cells: [
                            'A uniform shape, firmness and feel',
                            'A bit more like natural breast tissue',
                        ],
                    },
                    {
                        label: 'If the shell tears',
                        cells: [
                            'The implant deflates and the body absorbs the saline, so you can see it',
                            "The gel doesn't collapse, and most ruptures are silent, with no symptoms",
                        ],
                    },
                    {
                        label: 'Screening scans',
                        cells: [
                            'None needed, because a rupture shows',
                            `An ultrasound or MRI at ${figure('silicone-screening')}, then every ${figure('silicone-screening', 1)}`,
                        ],
                    },
                    {
                        label: 'FDA minimum age, for augmentation',
                        cells: [
                            `${capitalize(figure('fda-ages'))} or older`,
                            `${capitalize(figure('fda-ages', 1))} or older`,
                        ],
                    },
                    {
                        label: 'Price at Alluring',
                        cells: [
                            `${figure('price-saline')} for saline`,
                            `${figure('price-silicone')} for silicone`,
                        ],
                    },
                ]}
                note='Fill, feel and ruptures from ASPS and the FDA; the screening schedule and minimum ages are the FDA’s. Your surgeon tells you which implant suits you at your exam.'
            />

            <h3 className={cn(moduleH3, 'mt-10 md:mt-11')}>
                Smooth or textured?
            </h3>
            <p className={cn(moduleBody, 'mt-3')}>
                Implants also differ in their shell. The FDA says BIA-ALCL, a
                cancer of the immune system, develops more often with textured
                implants than with smooth ones, and ASPS says smooth implants
                may show some rippling under the skin. Ask any surgeon which
                maker and which surface they use, and why.
            </p>
        </AnswerBlock>
    )
}

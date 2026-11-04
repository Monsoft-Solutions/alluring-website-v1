import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'

import { ModuleComparison } from '@/components/procedures/module-kit/module-comparison.component'
import {
    moduleBody,
    moduleH3,
    moduleLink,
    moduleSectionPad,
} from '@/components/procedures/module-kit/module-ui.constant'
import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'
import { breastAugmentationFigure as figure } from '@/lib/data/procedures/facts/breast-augmentation.facts'

/**
 * "Saline or silicone implants: what's the difference?" The two implants the
 * practice prices, side by side in the kit's `ModuleComparison`: what fills
 * each, how it feels, what a rupture looks like, the FDA's screening
 * schedule, and the price here. The full comparison belongs to
 * `/blog/saline-vs-silicone-breast-implants` (the registry moved "silicone
 * implants", "saline implants" and "gummy bear implants" to it), so this
 * section explains the difference briefly, keeps what only this page has,
 * the prices, and links there. Shaped implants wait on the owner and on the
 * post.
 *
 * Which maker's implants Dr. Karlinsky uses, and whether smooth or
 * textured, wait on the owner, so the section never claims either; it
 * tells readers what the surface means and to ask.
 */
export function BreastAugmentationImplants() {
    return (
        <AnswerBlock
            id='implants'
            question="Saline or silicone implants: what's the difference?"
            className={moduleSectionPad}
            answer={`Silicone gel feels a bit more like natural breast tissue, ASPS says, but a silicone rupture is often silent, so the FDA recommends screening scans. A saline rupture shows, because the implant deflates. At Alluring, breast augmentation starts at ${figure('price-saline')} with saline and ${figure('price-silicone')} with silicone. Your surgeon recommends one at your exam.`}
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
                            "The gel doesn't collapse, and a rupture is often silent, with no symptoms",
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
                        label: 'Breast augmentation at Alluring',
                        cells: [
                            `From ${figure('price-saline')} with saline`,
                            `From ${figure('price-silicone')} with silicone`,
                        ],
                    },
                ]}
                note='Fill, feel and ruptures from ASPS and the FDA; the screening schedule is the FDA’s.'
            />
            <p className={cn(moduleBody, 'mt-5')}>
                <Link
                    href='/blog/saline-vs-silicone-breast-implants'
                    className={cn(moduleLink, 'font-bold')}
                >
                    Saline vs silicone implants: how to choose
                </Link>
            </p>

            <h3 className={cn(moduleH3, 'mt-10 md:mt-11')}>
                Smooth or textured?
            </h3>
            <p className={cn(moduleBody, 'mt-3')}>
                Implants also differ in their shell. The FDA says BIA-ALCL, a
                cancer of the immune system, develops more often with textured
                implants than with smooth ones, and ASPS says smooth implants
                may show some rippling under the skin. Ask any surgeon which
                maker and which surface they use, and why.{' '}
                <Link
                    href='/blog/breast-implant-rippling-bottoming-out'
                    className={moduleLink}
                >
                    Rippling and bottoming out: causes and fixes
                </Link>
            </p>
        </AnswerBlock>
    )
}

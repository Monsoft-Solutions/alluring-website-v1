import { cn } from '@workspace/ui/lib/utils'

import { ModuleSteps } from '@/components/procedures/module-kit/module-steps.component'
import {
    moduleBody,
    moduleSectionPad,
} from '@/components/procedures/module-kit/module-ui.constant'
import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'
import { lipoFigure } from '@/lib/data/procedures/facts/lipo.facts'
import type { ProcedureStep } from '@/lib/types/procedure.type'

/**
 * "What happens on the day of liposuction?" The steps are
 * `procedure.process`, the same list the page graph's `howPerformed` reads,
 * so the visible steps and the structured data cannot differ.
 */
export function LipoProcedureSteps({ process }: { process: ProcedureStep[] }) {
    return (
        <AnswerBlock
            id='procedure'
            question='What happens on the day of liposuction?'
            className={moduleSectionPad}
            answer={`Liposuction at Alluring usually takes ${lipoFigure('surgery-1-3-hours')} under general anesthesia or local anesthesia with sedation, and you go home the same day. Your surgeon marks each area, numbs it with fluid, removes fat through small incisions with a thin cannula, then fits your compression garment.`}
        >
            <p className={cn(moduleBody, 'mt-4.5')}>
                Before surgery day, your surgeon examines you, reviews your
                health history and medications, and plans which areas to treat
                and how much fat to remove from each.
            </p>
            <ModuleSteps
                steps={process.map((step) => ({
                    title: step.title,
                    body: step.description,
                }))}
            />
            <p className={cn(moduleBody, 'mt-8')}>
                Someone needs to drive you home. Walk as soon as you can, which
                helps prevent blood clots, as MedlinePlus advises.
            </p>
        </AnswerBlock>
    )
}

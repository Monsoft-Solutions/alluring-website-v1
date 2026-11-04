import { cn } from '@workspace/ui/lib/utils'

import { ModuleSteps } from '@/components/procedures/module-kit/module-steps.component'
import {
    moduleBody,
    moduleSectionPad,
} from '@/components/procedures/module-kit/module-ui.constant'
import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'
import { breastLiftFigure } from '@/lib/data/procedures/facts/breast-lift.facts'
import type { ProcedureStep } from '@/lib/types/procedure.type'

/**
 * "What happens on the day of a breast lift?" The steps are
 * `procedure.process`, the same list the page graph's `howPerformed` reads,
 * so the visible steps and the structured data cannot differ.
 *
 * How long each lift takes at Alluring is an owner question, so the answer
 * gives the published range, attributed, and leaves hers to the
 * consultation.
 */
export function BreastLiftProcedureSteps({
    process,
}: {
    process: ProcedureStep[]
}) {
    return (
        <AnswerBlock
            id='procedure'
            question='What happens on the day of a breast lift?'
            className={moduleSectionPad}
            answer={`A breast lift is usually done under general anesthesia. Cleveland Clinic's sources give ${breastLiftFigure('surgery-time')} or ${breastLiftFigure('surgery-time', 1)}, so ask how long yours will take. Your surgeon makes the incision your lift needs, lifts and reshapes the breast, moves the nipple higher, removes loose skin, places any planned implants and closes. You usually go home the same day.`}
        >
            <p className={cn(moduleBody, 'mt-4.5')}>
                Before surgery day, your surgeon examines you, reviews your
                health history and medications, and tells you how long your
                surgery will take and what to prepare at home.
            </p>
            <ModuleSteps
                steps={process.map((step) => ({
                    title: step.title,
                    body: step.description,
                }))}
            />
            <p className={cn(moduleBody, 'mt-8')}>
                Someone needs to drive you home and stay with you after surgery.
                You wake up in a soft support bra or a surgical dressing, which
                holds the breasts while they heal.
            </p>
        </AnswerBlock>
    )
}

import { cn } from '@workspace/ui/lib/utils'

import { ModuleSteps } from '@/components/procedures/module-kit/module-steps.component'
import {
    moduleBody,
    moduleSectionPad,
} from '@/components/procedures/module-kit/module-ui.constant'
import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'
import { tummyTuckFigure } from '@/lib/data/procedures/facts/tummy-tuck.facts'
import type { ProcedureStep } from '@/lib/types/procedure.type'

/**
 * "What happens on the day of a tummy tuck?" The steps are
 * `procedure.process`, the same list the page graph's `howPerformed` reads,
 * so the visible steps and the structured data cannot differ.
 *
 * How long each type takes at Alluring is an owner question, so the answer
 * gives Cleveland Clinic's range, attributed, and leaves hers to the
 * consultation.
 */
export function TummyTuckProcedureSteps({
    process,
}: {
    process: ProcedureStep[]
}) {
    return (
        <AnswerBlock
            id='procedure'
            question='What happens on the day of a tummy tuck?'
            className={moduleSectionPad}
            answer={`A tummy tuck is done under general anesthesia, and Cleveland Clinic says it can take ${tummyTuckFigure('surgery-1-5-hours')}, depending on the type. Your surgeon marks the incision while you stand, repairs the muscles when needed, removes the loose skin, closes the incision and fits your compression garment. You usually go home the same day.`}
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
                Someone needs to drive you home and, ASPS advises, stay with you
                for at least the first night. You walk on the day of surgery,
                which keeps the risk of blood clots in the legs low.
            </p>
        </AnswerBlock>
    )
}

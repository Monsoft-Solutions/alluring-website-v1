import { cn } from '@workspace/ui/lib/utils'

import { ModuleSteps } from '@/components/procedures/module-kit/module-steps.component'
import {
    moduleBody,
    moduleSectionPad,
} from '@/components/procedures/module-kit/module-ui.constant'
import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'
import type { ProcedureStep } from '@/lib/types/procedure.type'

/**
 * "What happens during a mommy makeover?" The steps are `procedure.process`,
 * the same list the page graph's `howPerformed` reads, so the visible steps and
 * the structured data cannot differ.
 *
 * How long a plan takes at Alluring, and whether anyone stays overnight, are
 * owner questions, so the answer gives neither.
 */
export function MommyMakeoverProcedureSteps({
    process,
}: {
    process: ProcedureStep[]
}) {
    return (
        <AnswerBlock
            id='procedure'
            question='What happens during a mommy makeover?'
            className={moduleSectionPad}
            answer='Your surgeon settles with you which parts your plan includes and tells you how long your surgery will take. You receive general anesthesia, and your surgeon performs your breast procedure, your tummy tuck and any liposuction, in the order she sets. ASPS says a mommy makeover is typically performed as a single-stage procedure.'
        >
            <ModuleSteps
                steps={process.map((step) => ({
                    title: step.title,
                    body: step.description,
                }))}
            />
            <p className={cn(moduleBody, 'mt-8')}>
                The Aesthetic Society says you cannot go home alone or stay home
                without another adult present, and to set up a support system
                for the full recovery.
            </p>
        </AnswerBlock>
    )
}

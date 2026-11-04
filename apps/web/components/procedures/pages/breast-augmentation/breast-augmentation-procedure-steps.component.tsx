import { cn } from '@workspace/ui/lib/utils'

import { ModuleSteps } from '@/components/procedures/module-kit/module-steps.component'
import {
    moduleBody,
    moduleSectionPad,
} from '@/components/procedures/module-kit/module-ui.constant'
import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'
import type { ProcedureStep } from '@/lib/types/procedure.type'

/**
 * "What happens on the day of surgery?" The steps are `procedure.process`,
 * the same list the page graph's `howPerformed` reads, so the visible steps
 * and the structured data cannot differ.
 *
 * How long breast augmentation takes at Alluring is an owner question, so
 * the answer gives the FDA's range for implant surgery, attributed, and
 * leaves hers to the consultation.
 */
export function BreastAugmentationProcedureSteps({
    process,
}: {
    process: ProcedureStep[]
}) {
    return (
        <AnswerBlock
            id='procedure'
            question='What happens on the day of surgery?'
            className={moduleSectionPad}
            answer='Breast augmentation is usually done under general anesthesia, and the FDA says implant surgery can last from one to several hours. Your surgeon makes the incision, places the implant under or over the chest muscle and closes in layers. Most people go home the same day, typically after about an hour of monitoring (ASPS).'
        >
            <p className={cn(moduleBody, 'mt-4.5')}>
                Before surgery day, your surgeon reviews your health and
                medications, goes through the FDA&apos;s patient decision
                checklist with you, and tells you how long your surgery will
                take and what to prepare at home.
            </p>
            <ModuleSteps
                steps={process.map((step) => ({
                    title: step.title,
                    body: step.description,
                }))}
            />
            <p className={cn(moduleBody, 'mt-8')}>
                Someone needs to drive you home and, Cleveland Clinic advises,
                stay with you the first night at least. Button-front tops are
                easier to put on while raising your arms is hard.
            </p>
        </AnswerBlock>
    )
}

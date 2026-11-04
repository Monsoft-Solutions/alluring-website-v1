import { cn } from '@workspace/ui/lib/utils'

import {
    ModuleSurgeonActions,
    ModuleSurgeonCredentials,
} from '@/components/procedures/module-kit/module-surgeon.component'
import {
    moduleBody,
    moduleSectionPad,
} from '@/components/procedures/module-kit/module-ui.constant'
import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'
import {
    KARLINSKY_CREDENTIALS,
    KARLINSKY_NAME,
    KARLINSKY_SHORT_NAME,
} from '@/lib/data/surgeons/karlinsky-credentials.constant'

/**
 * "Who performs breast lifts at Alluring?" The question behind every "best
 * breast lift surgeon in Miami" search, answered without the superlative:
 * one named surgeon, with each credential linked to the issuing body's own
 * record (the kit's `ModuleSurgeonCredentials`).
 */
export function BreastLiftSurgeon() {
    return (
        <AnswerBlock
            id='surgeon'
            question='Who performs breast lifts at Alluring?'
            className={moduleSectionPad}
            answer={`Every breast lift at Alluring is performed by ${KARLINSKY_NAME}. ${KARLINSKY_CREDENTIALS} She examines you before surgery, decides with you whether a lift alone or a lift with implants fits, and performs the surgery herself.`}
        >
            <p className={cn(moduleBody, 'mt-4.5')}>
                Searching for a breast lift in Miami turns up specials and a
                wide spread of prices. What separates surgeons is whether they
                tell you which lift you need and why, whether you need implants
                at all, where they operate, and whether you can check their
                credentials yourself.
            </p>

            <ModuleSurgeonCredentials />

            <p className={cn(moduleBody, 'mt-9')}>
                At your consultation, {KARLINSKY_SHORT_NAME} examines your
                breasts, checks how far they have dropped and how much skin
                there is to remove, and tells you which lift fits your goals,
                including when implants alone, a breast reduction or waiting
                would suit you better.
            </p>
            <ModuleSurgeonActions />
        </AnswerBlock>
    )
}

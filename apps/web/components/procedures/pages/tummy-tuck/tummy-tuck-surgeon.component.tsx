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
 * "Who performs tummy tucks at Alluring?" The question behind every "best
 * tummy tuck surgeon in Miami" search, answered without the superlative:
 * one named surgeon, with each credential linked to the issuing body's own
 * record (the kit's `ModuleSurgeonCredentials`).
 */
export function TummyTuckSurgeon() {
    return (
        <AnswerBlock
            id='surgeon'
            question='Who performs tummy tucks at Alluring?'
            className={moduleSectionPad}
            answer={`Every tummy tuck at Alluring is performed by ${KARLINSKY_NAME}. ${KARLINSKY_CREDENTIALS} She examines you before surgery, decides with you which tummy tuck fits and performs the surgery herself.`}
        >
            <p className={cn(moduleBody, 'mt-4.5')}>
                Searching for a tummy tuck in Miami turns up specials and a wide
                spread of prices. What separates surgeons is whether they tell
                you which tummy tuck you need and why, how they repair the
                muscles, where they operate, and whether you can check their
                credentials yourself.
            </p>

            <ModuleSurgeonCredentials />

            <p className={cn(moduleBody, 'mt-9')}>
                At your consultation, {KARLINSKY_SHORT_NAME} examines your
                abdomen, checks whether your muscles have separated, and tells
                you which tummy tuck fits your goals, including when liposuction
                alone, a mommy makeover or waiting would suit you better.
            </p>
            <ModuleSurgeonActions />
        </AnswerBlock>
    )
}

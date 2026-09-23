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
 * "Who performs liposuction at Alluring?" The question behind every "best
 * liposuction surgeon in Miami" search, answered without the superlative:
 * one named surgeon, with each credential linked to the issuing body's own
 * record (the kit's `ModuleSurgeonCredentials`).
 */
export function LipoSurgeon() {
    return (
        <AnswerBlock
            id='surgeon'
            question='Who performs liposuction at Alluring?'
            className={moduleSectionPad}
            answer={`Every liposuction at Alluring is performed by ${KARLINSKY_NAME}. ${KARLINSKY_CREDENTIALS} She examines you before surgery, plans each area with you and performs the surgery herself.`}
        >
            <p className={cn(moduleBody, 'mt-4.5')}>
                Searching for liposuction in Miami turns up weekly specials and
                a wide spread of prices. What separates surgeons is how they
                plan each area, how much fat they remove in one surgery and
                where they operate, and whether you can check their credentials
                yourself.
            </p>

            <ModuleSurgeonCredentials />

            <p className={cn(moduleBody, 'mt-9')}>
                At your consultation, {KARLINSKY_SHORT_NAME} examines you, looks
                at where you carry fat and how your skin will respond, and tells
                you whether liposuction, Lipo 360 or another procedure fits your
                goals, including when liposuction is not the right choice.
            </p>
            <ModuleSurgeonActions />
        </AnswerBlock>
    )
}

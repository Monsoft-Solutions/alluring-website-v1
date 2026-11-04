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
 * "Who performs a mommy makeover at Alluring?" The question behind every
 * "best mommy makeover surgeon" search, answered without the superlative: one
 * named surgeon, with each credential linked to the issuing body's own record
 * (the kit's `ModuleSurgeonCredentials`).
 */
export function MommyMakeoverSurgeon() {
    return (
        <AnswerBlock
            id='surgeon'
            question='Who performs a mommy makeover at Alluring?'
            className={moduleSectionPad}
            answer={`One surgeon performs every mommy makeover at Alluring: ${KARLINSKY_NAME}. ${KARLINSKY_CREDENTIALS} You can check each credential on the issuing body's own website, linked below.`}
        >
            <p className={cn(moduleBody, 'mt-4.5')}>
                Searching for a mommy makeover in Miami turns up specials and a
                wide spread of prices. What separates surgeons is whether they
                tell you which parts you need and why, whether they tell you
                when a plan should be split, where they operate, and whether you
                can check their credentials yourself.
            </p>

            <ModuleSurgeonCredentials />

            <p className={cn(moduleBody, 'mt-9')}>
                At your consultation, {KARLINSKY_SHORT_NAME} examines you and
                tells you which parts your plan needs, including when fewer
                parts, one procedure or waiting would suit you better.
            </p>
            <ModuleSurgeonActions />
        </AnswerBlock>
    )
}

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
 * "Who performs breast augmentation at Alluring?" The question behind every
 * "best breast augmentation surgeon in Miami" search, answered without the
 * superlative: one named surgeon, with each credential linked to the
 * issuing body's own record (the kit's `ModuleSurgeonCredentials`). It
 * follows the dark band, whose checklist ends "Ask Dr. Karlinsky every one
 * of them".
 */
export function BreastAugmentationSurgeon() {
    return (
        <AnswerBlock
            id='surgeon'
            question='Who performs breast augmentation at Alluring?'
            className={moduleSectionPad}
            answer={`Every breast augmentation at Alluring is performed by ${KARLINSKY_NAME}. ${KARLINSKY_CREDENTIALS} She examines you before surgery, helps you choose the implant, size and placement, and performs the surgery herself.`}
        >
            <p className={cn(moduleBody, 'mt-4.5')}>
                Searching for breast augmentation in Miami turns up specials and
                a wide spread of prices. What separates surgeons is whether they
                help you choose a size you won&apos;t want to change, explain
                the FDA&apos;s checklist and the scan schedule, tell you where
                they operate, and let you check their credentials yourself.
            </p>

            <ModuleSurgeonCredentials />

            <p className={cn(moduleBody, 'mt-9')}>
                At your consultation, {KARLINSKY_SHORT_NAME} examines you, talks
                through the look you want in clothes, and tells you which
                implant, size and placement fit, including when a breast lift or
                waiting would suit you better.
            </p>
            <ModuleSurgeonActions />
        </AnswerBlock>
    )
}

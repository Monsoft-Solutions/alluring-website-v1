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
 * "BBL surgeons in Miami: who performs your procedure." Every BBL at Alluring
 * is Dr. Karlinsky's. Each credential links to the issuing body's own record,
 * which is the check the safety section tells readers to make.
 *
 * The portrait, the credential list and the two buttons are the kit's
 * (`module-surgeon.component.tsx`), which follows Florida Rule 64B8-11.001.
 */
export function BblSurgeon() {
    return (
        <AnswerBlock
            id='surgeon'
            question='BBL surgeons in Miami: who performs your procedure'
            className={moduleSectionPad}
            answer={`Every BBL at Alluring is performed by ${KARLINSKY_NAME}. ${KARLINSKY_CREDENTIALS} She examines you in person before surgery and confirms your price.`}
        >
            <p className={cn(moduleBody, 'mt-4.5')}>
                Searching for a BBL surgeon in Miami turns up a long list of
                names and a wide spread of prices. When you compare surgeons,
                ask where they place the fat, how many patients they operate on
                at once, and where you can check their credentials yourself.
            </p>

            <ModuleSurgeonCredentials />

            <p className={cn(moduleBody, 'mt-9')}>
                At your consultation, {KARLINSKY_SHORT_NAME} examines you, looks
                at where you carry fat, and tells you which type of BBL fits
                your body and your goals, including when a BBL is not the right
                choice.
            </p>
            <ModuleSurgeonActions />
        </AnswerBlock>
    )
}

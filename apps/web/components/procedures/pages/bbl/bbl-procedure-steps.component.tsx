import { cn } from '@workspace/ui/lib/utils'

import { ModuleSteps } from '@/components/procedures/module-kit/module-steps.component'
import {
    moduleBody,
    moduleSectionPad,
} from '@/components/procedures/module-kit/module-ui.constant'
import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'

const steps = [
    {
        title: 'Liposuction',
        body: 'Through small incisions, the surgeon fills the donor areas with a fluid that numbs the tissue and reduces bleeding, then removes fat with a thin cannula. This is also when your waist is shaped.',
    },
    {
        title: 'Preparing the fat',
        body: 'The fat is separated from fluid and blood, so only usable fat is transferred.',
    },
    {
        title: 'Placing the fat',
        body: 'The surgeon injects the fat into the layer under the skin of the buttocks, watching the cannula on ultrasound so it never passes into the muscle.',
    },
    {
        title: 'Closing and compression',
        body: 'The small incisions are closed and you are fitted with a compression garment, which you wear 24/7 for the first month, or as your surgeon directs.',
    },
]

/**
 * "How is BBL surgery performed?" The surgery is a sequence, so the steps
 * are numbered.
 */
export function BblProcedureSteps() {
    return (
        <AnswerBlock
            id='procedure'
            question='How is BBL surgery performed?'
            className={moduleSectionPad}
            answer='BBL surgery takes 3 to 5 hours under general anesthesia, and you go home the same day. The surgeon removes fat with liposuction, prepares it, injects it under the skin of the buttocks with ultrasound guidance, then closes the small incisions and fits your compression garment.'
        >
            <p className={cn(moduleBody, 'mt-4.5')}>
                Before surgery day, your surgeon examines you in person, reviews
                your health history and medications, and plans where fat will be
                taken from and where it will go.
            </p>
            <ModuleSteps steps={steps} />
            <p className={cn(moduleBody, 'mt-8')}>
                Someone needs to drive you home and stay with you for the first
                days. Walking starts early, on day 1 or 2.
            </p>
        </AnswerBlock>
    )
}

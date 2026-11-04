import {
    moduleBody,
    moduleLink,
    moduleSectionPad,
} from '@/components/procedures/module-kit/module-ui.constant'
import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'
import { cn } from '@workspace/ui/lib/utils'

/**
 * "Which tummy tuck do I need?" The question she asks before the price, so it
 * sits above the price section and gives the direct answer an engine can lift.
 * The side-by-side comparison stays in the price section, under the prices.
 * Type names only: the prices live in `TummyTuckCost`.
 */
export function TummyTuckWhichType() {
    return (
        <AnswerBlock
            id='which-tummy-tuck'
            question='Which tummy tuck do I need?'
            className={moduleSectionPad}
            answer='It depends on where your loose skin sits and whether your muscles have separated. A mini treats loose skin below the belly button. A full treats the whole abdomen and usually repairs separated muscles. An extended reaches the hips. A fleur-de-lis adds a vertical scar, usually after major weight loss. Your surgeon confirms which one at your exam.'
        >
            <p className={cn(moduleBody, 'mt-5')}>
                <a href='#book' className={moduleLink}>
                    Your surgeon confirms your type and price at your exam.
                </a>
            </p>
        </AnswerBlock>
    )
}

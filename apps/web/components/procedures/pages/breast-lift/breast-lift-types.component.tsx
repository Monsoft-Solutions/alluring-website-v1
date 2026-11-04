import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'

import {
    moduleBody,
    moduleLink,
    moduleSectionPad,
} from '@/components/procedures/module-kit/module-ui.constant'
import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'

import { BreastLiftPatternsDiagram } from './breast-lift-patterns.component'

/**
 * "What are the types of breast lift?" People search for the four by name
 * (about 7,100 searches a month in Keyword Planner, 3 Nov 2026), so they get a
 * heading of their own. Which technique each of the practice's prices covers
 * is an owner question, so nothing here names a price.
 */
export function BreastLiftTypes() {
    return (
        <AnswerBlock
            id='types'
            question='What are the types of breast lift?'
            className={moduleSectionPad}
            answer='There are four, named for their incisions: crescent, donut, lollipop and anchor. More sagging usually needs a longer scar, so the type depends on how far your breasts have dropped and how much skin there is to remove. Your surgeon recommends one at your exam.'
        >
            <BreastLiftPatternsDiagram />
            <p className={cn(moduleBody, 'mt-6')}>
                <Link href='/blog/types-of-breast-lift' className={moduleLink}>
                    The types of breast lift compared
                </Link>
                , with who each one suits and where each scar sits.
            </p>
        </AnswerBlock>
    )
}

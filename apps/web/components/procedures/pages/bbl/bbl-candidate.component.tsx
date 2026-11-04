import Link from 'next/link'

import {
    moduleLink,
    moduleSectionPad,
} from '@/components/procedures/module-kit/module-ui.constant'
import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'

import { BblBookPrompt } from './bbl-book-prompt.component'

/**
 * "Am I a candidate for a BBL, and do I have enough fat?" Answered before the
 * cost, because on a phone this question used to wait for the options section
 * and the FAQ. No fat or BMI figure here: no source read gives one for a BBL,
 * so the number stays on the BMI guide, with its caveats.
 */
export function BblCandidate() {
    return (
        <AnswerBlock
            id='candidate'
            question='Am I a candidate for a BBL, and do I have enough fat?'
            className={moduleSectionPad}
            answer={
                <>
                    Cleveland Clinic says you need{' '}
                    <Link
                        href='/blog/do-i-have-enough-fat-for-a-bbl'
                        className={moduleLink}
                    >
                        enough excess fat
                    </Link>{' '}
                    elsewhere on your body. Leaner patients may suit a smaller
                    transfer, and some may suit implants instead. Only an exam
                    tells you.{' '}
                    <Link href='/bmi-calculator#bbl' className={moduleLink}>
                        Our BMI guide
                    </Link>{' '}
                    shows what we recommend for a BBL.
                </>
            }
        >
            <BblBookPrompt />
        </AnswerBlock>
    )
}

import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'

import {
    moduleBody,
    moduleH3,
    moduleLink,
    moduleSectionPad,
} from '@/components/procedures/module-kit/module-ui.constant'
import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'
import {
    FactTable,
    type Fact,
} from '@/components/procedures/sections/fact-table.component'
import { mommyMakeoverFigure } from '@/lib/data/procedures/facts/mommy-makeover.facts'
import {
    KARLINSKY_NAME,
    KARLINSKY_SHORT_NAME,
} from '@/lib/data/surgeons/karlinsky-credentials.constant'

/**
 * "What is a mommy makeover?" and the at-a-glance table: the site's one
 * definition (`quickAnswer` in the data file says the same thing), with the
 * figures a reader scans for as label → value rows. It follows the price on
 * this page, because the hero has already said what a mommy makeover is and
 * the price of each part is what she came to find.
 *
 * How long a plan takes at Alluring is an owner question, so the table says
 * so rather than giving a number. "General anesthesia" stays as the tummy tuck
 * page has it, and is on the list of what the owner should confirm.
 */
export function MommyMakeoverWhatIs() {
    const facts: Fact[] = [
        {
            label: 'The usual parts',
            value: 'A tummy tuck; a breast lift, augmentation or reduction; and liposuction (The Aesthetic Society)',
        },
        { label: 'Your surgeon', value: KARLINSKY_NAME },
        {
            label: 'Prices',
            value: `Part by part: mini tummy tuck from ${mommyMakeoverFigure('price-mini-tummy-tuck')}, full tummy tuck from ${mommyMakeoverFigure('price-full-tummy-tuck')}, breast augmentation from ${mommyMakeoverFigure('price-augmentation-saline')}, breast lift from ${mommyMakeoverFigure('price-lift')}`,
        },
        { label: 'Surgery length', value: 'Set at your consultation' },
        { label: 'Anesthesia', value: 'General anesthesia' },
        {
            label: 'Time off work',
            value: `About ${mommyMakeoverFigure('work-2-weeks')} (The Aesthetic Society)`,
        },
        {
            label: 'Small children',
            value: `Someone else in charge of their care for at least ${mommyMakeoverFigure('children-2-weeks')} (The Aesthetic Society)`,
        },
        {
            label: 'Driving',
            value: `You may be comfortable in ${mommyMakeoverFigure('driving-2-3-weeks')} (The Aesthetic Society)`,
        },
        {
            label: 'Lifting your children',
            value: `Not for ${mommyMakeoverFigure('lifting-children-4-6-weeks')} (The Aesthetic Society)`,
        },
        {
            label: 'Final result',
            value: `${mommyMakeoverFigure('results-6-12-months', 1)} to a year (Frank Campanile, MD, on the ASPS website)`,
        },
        {
            label: 'Florida office limits',
            value: `${mommyMakeoverFigure('florida-8-hours')} of surgery; ${mommyMakeoverFigure('florida-1000cc')} of liposuction with a tummy tuck`,
        },
    ]

    return (
        <AnswerBlock
            id='what-is-a-mommy-makeover'
            question='What is a mommy makeover?'
            answerClassName='quick-answer'
            className={moduleSectionPad}
            answer={`A mommy makeover combines procedures that restore the shape of a woman's body after childbearing, usually a tummy tuck with breast surgery and often liposuction. ASPS says it is typically performed as a single-stage procedure. At Alluring in Miami, one surgeon performs every mommy makeover: ${KARLINSKY_NAME}.`}
        >
            <FactTable
                caption='Mommy makeover at Alluring, at a glance'
                facts={facts}
                className='mt-10 md:mt-11'
            />

            <h3 className={cn(moduleH3, 'mt-10 md:mt-11')}>
                What is a mini mommy makeover?
            </h3>
            <p className={cn(moduleBody, 'mt-3.5')}>
                The name has no fixed definition, so ask any clinic which parts
                it includes. If it means a mini tummy tuck with breast surgery,
                note that on our price list a mini tummy tuck doesn&apos;t
                include muscle repair: it starts at{' '}
                {mommyMakeoverFigure('price-mini-tummy-tuck')}, against{' '}
                {mommyMakeoverFigure('price-full-tummy-tuck')} for a full tummy
                tuck. Whether a mini fits depends on where your loose skin sits
                and whether your muscles have separated, which{' '}
                {KARLINSKY_SHORT_NAME} tells you at your exam.
            </p>

            <p className={cn(moduleBody, 'mt-5')}>
                Weighing it against one procedure? Read{' '}
                <Link
                    href='/blog/tummy-tuck-mommy-makeover-miami'
                    className={moduleLink}
                >
                    tummy tuck or mommy makeover: which one do you need?
                </Link>{' '}
                If a BBL is also on your list,{' '}
                <Link
                    href='/blog/tummy-tuck-vs-bbl-miami'
                    className={moduleLink}
                >
                    BBL, tummy tuck and mommy makeover compared
                </Link>{' '}
                sets them side by side.
            </p>
        </AnswerBlock>
    )
}

import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'

import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'

import { bblBody, bblH3, bblLink, bblSectionPad } from './bbl-ui.constant'

/**
 * The sourced recovery standard approved on 2026-09-14: every figure is a
 * fact in `bbl.facts.ts`, attributed the way that file says it must be.
 */
const milestones = [
    {
        when: 'Days 1–2',
        body: 'Short walks start. The Aesthetic Society says you should be able to get up and walk after the second day, which helps prevent blood clots.',
    },
    {
        when: 'Weeks 1–2',
        body: 'The strictest stretch: no sitting or lying on your buttocks for at least 2 weeks, and sleep on your stomach or side. Most people need some pain medication for the first 4 to 5 days, and Cleveland Clinic says pain eases after 1 to 2 weeks.',
    },
    {
        when: 'Days 10–14',
        body: 'Back to a desk job and driving, sitting on a BBL pillow. Some surgeons allow work between days 7 and 10; a job that involves lifting needs longer.',
    },
    {
        when: 'Month 1',
        body: 'Compression garment 24/7, except in the shower, or as your surgeon directs. No heavy lifting or strenuous exercise.',
    },
    {
        when: 'Month 2',
        body: 'Garment at least 12 hours a day, or as your surgeon directs. Light activity such as fast walking. Sit only briefly on a pillow, about 10 minutes at a time through week 6, as a plastic surgeon interviewed by ASPS advises.',
    },
    {
        when: 'Week 8',
        body: 'Most people sit without a pillow and return to normal exercise, once their surgeon clears them.',
    },
    {
        when: 'Months 2–3',
        body: 'Most people feel recovered, though it can take up to 6 months. The risk of losing grafted fat drops around month 3.',
    },
    {
        when: 'Months 3–6',
        body: 'Your final shape shows. About 50% to 80% of the grafted fat survives.',
    },
]

const guides = [
    {
        label: 'When you can sit after a BBL',
        href: '/how-long-after-bbl-can-i-sit',
    },
    { label: 'How to sleep after a BBL', href: '/how-to-sleep-after-bbl' },
    {
        label: 'The compression garment, stage by stage',
        href: '/blog/bbl-compression-garment-timeline',
    },
    {
        label: 'Lymphatic massage after a BBL',
        href: '/how-many-massages-after-bbl',
    },
    {
        label: 'Which workouts come back when',
        href: '/blog/exercises-after-bbl-timeline',
    },
    { label: 'Flying home after a BBL', href: '/blog/flying-after-bbl-tips' },
    {
        label: 'Odor after a BBL, and when it matters',
        href: '/why-do-bbl-stink',
    },
]

/**
 * "What does BBL recovery look like, week by week?" The timeline's rule and
 * dots are drawn by `bbl-page.css` from the list items: the rule draws down
 * and each dot fills as that stage reaches the middle of the screen.
 */
export function BblRecoveryTimeline() {
    return (
        <AnswerBlock
            id='recovery'
            question='What does BBL recovery look like, week by week?'
            className={bblSectionPad}
            answer="Most people return to a desk job 10 to 14 days after a BBL, sit normally and exercise again at about 8 weeks, and feel recovered at 2 to 3 months, though it can take up to 6 months. The final shape shows at 3 to 6 months. Your surgeon's instructions come first."
        >
            <ol
                aria-label='BBL recovery timeline'
                className='mt-9 [--bbl-rail-x:0.625rem] md:mt-10 md:[--bbl-rail-x:9.625rem]'
            >
                {milestones.map((milestone) => (
                    <li
                        key={milestone.when}
                        className='bbl-milestone grid pb-6 pl-8 tabular-nums md:grid-cols-[8rem_minmax(0,1fr)] md:gap-x-[3.25rem] md:pb-7 md:pl-0'
                    >
                        <p className='text-[0.9375rem] leading-normal font-bold text-stone-900 md:text-base md:leading-[1.6]'>
                            {milestone.when}
                        </p>
                        <p className='mt-1 text-[1.0625rem] leading-[1.6] text-stone-700 md:mt-0 md:leading-[1.65]'>
                            {milestone.body}
                        </p>
                    </li>
                ))}
            </ol>

            <h3 className={cn(bblH3, 'mt-6')}>
                If you are flying in from another state
            </h3>
            <p className={cn(bblBody, 'mt-3 tabular-nums')}>
                Plan on 7 to 10 days in Miami, so you can be seen at follow-up
                and cleared before you fly. We confirm your surgery, pre-op and
                follow-up dates in writing and tell you how many nights to stay;
                you arrange the travel itself. ASPS&apos;s article on traveling
                after a BBL advises staying near your surgeon for at least 4 to
                5 days, because an infection typically shows up 3 to 5 days
                after surgery.
            </p>

            <div className='mt-10 border-t border-stone-200 pt-7'>
                <Link
                    href='/how-long-to-recover-from-bbl'
                    className={cn(
                        bblLink,
                        'font-serif text-xl leading-[1.3] md:text-[1.375rem]'
                    )}
                >
                    BBL recovery week by week
                </Link>
                <ul className='mt-3.5 grid gap-1 md:grid-cols-2 md:gap-x-8 md:gap-y-3'>
                    {guides.map((guide) => (
                        <li key={guide.href}>
                            <Link
                                href={guide.href}
                                className={cn(
                                    bblLink,
                                    'inline-flex min-h-10 items-center text-base leading-[1.45] md:min-h-0'
                                )}
                            >
                                {guide.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </AnswerBlock>
    )
}

import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'

import {
    ModuleGuideLinks,
    ModuleTimeline,
} from '@/components/procedures/module-kit/module-steps.component'
import {
    moduleBody,
    moduleH3,
    moduleLink,
    moduleSectionPad,
} from '@/components/procedures/module-kit/module-ui.constant'
import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'

import { BblBookPrompt } from './bbl-book-prompt.component'

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
        body: 'The strictest stretch: no sitting or lying on your buttocks for at least 2 weeks, and sleep on your stomach or side. A plastic surgeon interviewed by ASPS says most people need some pain medication for the first 4 to 5 days, and Cleveland Clinic says pain eases after 1 to 2 weeks.',
    },
    {
        when: 'Days 10–14',
        body: 'Cleveland Clinic says you should be able to go back to work between 10 and 14 days, and The Aesthetic Society says you can work and drive by then if you sit on a pillow. An ASPS article says patients return between days 7 and 10; a job that involves lifting needs longer.',
    },
    {
        when: 'Month 1',
        body: 'Compression garment 24/7, except in the shower, or as your surgeon directs (the schedule of a plastic surgeon interviewed by ASPS). No heavy lifting or strenuous exercise.',
    },
    {
        when: 'Month 2',
        body: 'Garment at least 12 hours a day, or as your surgeon directs (the same schedule). Light activity such as fast walking. Keep using a pillow when you sit. A plastic surgeon interviewed by ASPS advises keeping any sitting to about 10 minutes at a time for the first 6 weeks.',
    },
    {
        when: 'Week 8',
        body: 'Most people sit without a pillow and return to normal exercise, once their surgeon clears them.',
    },
    {
        when: 'Months 2–3',
        body: 'Most people feel recovered, though it can take up to 6 months. A plastic surgeon interviewed by ASPS says the risk of losing grafted fat drops around month 3.',
    },
    {
        when: 'Months 3–6',
        body: 'Your final shape shows, and results can keep settling after that. Of the transferred fat, ASPS says patients retain 60–80% on average, in some cases more and in others less.',
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
 * "What does BBL recovery look like, week by week?" The kit's timeline draws
 * the rule and dots from the list items (`module-kit.css`).
 */
export function BblRecoveryTimeline() {
    return (
        <AnswerBlock
            id='recovery'
            question='What does BBL recovery look like, week by week?'
            className={moduleSectionPad}
            answer="Most people return to a desk job 10 to 14 days after a BBL, sit normally and exercise again at about 8 weeks, and feel recovered at 2 to 3 months, though it can take up to 6 months. The final shape shows at 3 to 6 months, and results can keep settling after that. Your surgeon's instructions come first."
        >
            <ModuleTimeline
                label='BBL recovery timeline'
                milestones={milestones}
            />
            <BblBookPrompt note='You get your surgery, pre-op and follow-up dates in writing.' />

            <h3 className={cn(moduleH3, 'mt-10 md:mt-11')}>
                If you are flying in from another state
            </h3>
            <p className={cn(moduleBody, 'mt-3 tabular-nums')}>
                Plan on 7 to 10 days in Miami, so you can be seen at follow-up
                and cleared before you fly. We confirm your surgery, pre-op and
                follow-up dates in writing and tell you how many nights to stay;
                you arrange the travel itself. ASPS&apos;s article on traveling
                after a BBL advises staying near your surgeon for at least 4 to
                5 days, because an infection typically shows up 3 to 5 days
                after surgery.
            </p>
            <p className={cn(moduleBody, 'mt-4')}>
                You don&apos;t have to fly in to get started.{' '}
                <Link
                    href='/fly-in-consultation'
                    className={cn(moduleLink, 'font-bold')}
                >
                    Start with a virtual consultation
                </Link>{' '}
                and have your dates in writing before you book a flight.
            </p>

            <ModuleGuideLinks
                main={{
                    label: 'BBL recovery week by week',
                    href: '/how-long-to-recover-from-bbl',
                }}
                guides={guides}
            />
        </AnswerBlock>
    )
}

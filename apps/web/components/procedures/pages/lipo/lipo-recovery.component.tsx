import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'

import {
    ModuleGuideLinks,
    ModuleTimeline,
    type ModuleGuide,
    type ModuleMilestone,
} from '@/components/procedures/module-kit/module-steps.component'
import {
    moduleBody,
    moduleH3,
    moduleLink,
    moduleSectionPad,
} from '@/components/procedures/module-kit/module-ui.constant'
import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'
import { lipoFigure } from '@/lib/data/procedures/facts/lipo.facts'

/**
 * Every figure is a fact in `lipo.facts.ts`, attributed the way that file
 * says it must be. Where sources disagree (when people go back to work), the
 * timeline gives both.
 */
const milestones: ModuleMilestone[] = [
    {
        when: 'Day of surgery',
        body: 'You go home the same day. Walk as soon as you can, which helps prevent blood clots, as MedlinePlus advises.',
    },
    {
        when: 'First 48 hours',
        body: 'Swelling peaks around this point, according to The Aesthetic Society. Rest, take short walks and wear your garment.',
    },
    {
        when: 'Days 7–10',
        body: 'Bruising typically fades, according to The Aesthetic Society.',
    },
    {
        when: 'Within 10 days',
        body: 'Most people are back to most of their normal activities, according to The Aesthetic Society, and many return to a desk job within a few days.',
    },
    {
        when: 'Weeks 2–3',
        body: "Swelling has mostly gone down, according to The Aesthetic Society. ASPS's timeline puts a return to work here, depending on your job.",
    },
    {
        when: 'Weeks 4–6',
        body: 'The compression garment comes off and, once your surgeon clears you, strenuous exercise comes back, as The Aesthetic Society advises.',
    },
    {
        when: 'Up to 4 months',
        body: 'Slight swelling can linger, according to The Aesthetic Society.',
    },
    {
        when: 'Months 3–6',
        body: 'The swelling is gone and your final shape shows, as Cleveland Clinic describes.',
    },
]

const guides: ModuleGuide[] = [
    {
        label: 'Itching after liposuction, and what helps',
        href: '/how-to-reduce-itching-after-lipo',
    },
    {
        label: 'Lipo foam and your compression garment',
        href: '/what-is-lipo-foam',
    },
    {
        label: 'Lymphatic massage: when to start and how many',
        href: '/how-many-massages-after-lipo-360',
    },
    {
        label: 'Bruising after liposuction',
        href: '/how-to-get-rid-of-bruising-after-liposuction',
    },
    {
        label: 'Fibrosis after liposuction',
        href: '/how-to-get-rid-of-fibrosis-after-lipo',
    },
    {
        label: 'How to sleep after liposuction',
        href: '/how-to-sleep-after-liposuction',
    },
    {
        label: 'When you can work out again',
        href: '/how-long-after-lipo-can-i-workout',
    },
    {
        label: 'What to eat after liposuction',
        href: '/what-to-eat-after-liposuction',
    },
]

/**
 * "What is liposuction recovery like?" The timeline gives the milestones;
 * the blog posts that rank for each recovery question (itching, foam,
 * massages, fibrosis, sleep) own the details and are linked, not repeated.
 */
export function LipoRecovery() {
    return (
        <AnswerBlock
            id='recovery'
            question='What is liposuction recovery like?'
            className={moduleSectionPad}
            answer={`Most people go back to a desk job within a few days (The Aesthetic Society) or by weeks 2 to 3 (ASPS), wear a compression garment for ${lipoFigure('garment-4-6-weeks')} and avoid strenuous exercise for as long. Swelling mostly settles in ${lipoFigure('swelling-2-3-weeks-4-months')}, and the final shape shows at ${lipoFigure('results-3-6-months')}.`}
        >
            <ModuleTimeline
                label='Liposuction recovery timeline'
                milestones={milestones}
            />

            <h3 className={cn(moduleH3, 'mt-6')}>Does the fat come back?</h3>
            <p className={cn(moduleBody, 'mt-3')}>
                The fat cells liposuction removes don&apos;t come back:
                Cleveland Clinic says the procedure permanently removes them.
                The fat cells that remain can still grow if you gain weight, so
                ASPS says results last as long as you keep a stable weight and
                general fitness.
            </p>

            <h3 className={cn(moduleH3, 'mt-8')}>
                If you are flying in from another state
            </h3>
            <p className={cn(moduleBody, 'mt-3')}>
                Your surgeon tells you how many nights to stay in Miami before
                you fly home, and we confirm your surgery, pre-op and follow-up
                dates in writing. You arrange the travel itself.
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
                    label: 'Liposuction swelling and recovery, week by week',
                    href: '/how-to-reduce-swelling-after-liposuction',
                }}
                guides={guides}
            />
        </AnswerBlock>
    )
}

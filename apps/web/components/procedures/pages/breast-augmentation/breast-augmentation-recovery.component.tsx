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
import { breastAugmentationFigure as figure } from '@/lib/data/procedures/facts/breast-augmentation.facts'

/**
 * Every figure is a fact in `breast-augmentation.facts.ts`, attributed the
 * way that file says it must be. No source gives a figure for driving or
 * for "drop and fluff", so the timeline gives none and links the posts
 * that cover them.
 */
const milestones: ModuleMilestone[] = [
    {
        when: 'Day of surgery',
        body: 'You go home once you are stable, typically after an hour or so (ASPS), with someone to drive you and stay with you the first night at least (Cleveland Clinic). Rest and sleep on your back, propped up, for the first days (The Aesthetic Society).',
    },
    {
        when: `Days ${figure('pain-1-5-days').replace(' days', '')}`,
        body: `Acute pain typically eases after ${figure('pain-1-5-days')}, though soreness and swelling can last a few weeks (ASPS). Wear your support bra or band around the clock, as your surgeon instructs.`,
    },
    {
        when: 'A few days to a week',
        body: `Many people return to work, depending on the job (The Aesthetic Society). Cleveland Clinic says to take at least ${figure('time-off-cleveland')} off work, and at least ${figure('time-off-cleveland', 1)} for a physically demanding job.`,
    },
    {
        when: 'About a week',
        body: 'Stitches that need removing come out (The Aesthetic Society; Cleveland Clinic).',
    },
    {
        when: `Weeks ${figure('recover-1-2-weeks').replace(' weeks', '')}`,
        body: 'Recovery typically takes this long, The Aesthetic Society says, and most people are back to their usual routine.',
    },
    {
        when: `At least ${figure('sex-2-weeks')}`,
        body: 'Sex waits this long (The Aesthetic Society). Be gentle with your breasts for the month after that.',
    },
    {
        when: 'Within a month',
        body: 'Most remaining swelling resolves (The Aesthetic Society), and the final shape shows as the skin stretches (ASPS).',
    },
    {
        when: `At least ${figure('heavy-lifting-4-weeks')}`,
        body: 'No heavy lifting before then (Cleveland Clinic). If you have small children, line up help with lifting them, and ask your surgeon when you can carry them again.',
    },
    {
        when: `Up to ${figure('sports-6-weeks')}`,
        body: 'Sports and strenuous exercise come back, once your surgeon clears you (Cleveland Clinic).',
    },
    {
        when: `Weeks ${figure('full-recovery-6-8-weeks').replace(' weeks', '')}`,
        body: 'Full recovery, on average (Cleveland Clinic).',
    },
    {
        when: 'Months to a couple of years',
        body: 'The incision lines fade (ASPS).',
    },
    {
        when: `Years ${figure('silicone-screening').replace(' years', '')}`,
        body: `With silicone implants, your first ultrasound or MRI scan, then one every ${figure('silicone-screening', 1)} (FDA).`,
    },
]

const guides: ModuleGuide[] = [
    {
        label: 'Pain in the first week, and what helps',
        href: '/blog/breast-augmentation-pain-management',
    },
    {
        label: 'When you can drive again',
        href: '/how-long-after-breast-augmentation-can-i-drive',
    },
    {
        label: 'When you can sleep without a bra',
        href: '/when-can-i-sleep-without-a-bra-after-breast-augmentation',
    },
    {
        label: 'When you can sleep on your side',
        href: '/when-can-i-sleep-on-my-side-after-breast-augmentation',
    },
    {
        label: 'When you can do push-ups',
        href: '/when-can-i-do-push-ups-after-breast-augmentation',
    },
    {
        label: 'When you can swim',
        href: '/how-long-after-breast-augmentation-can-i-swim',
    },
    {
        label: 'When stitches dissolve',
        href: '/when-do-breast-augmentation-stitches-dissolve',
    },
    {
        label: 'Swelling, and one side sitting higher',
        href: '/blog/swelling-and-asymmetry-after-breast-augmentation-faq',
    },
]

/**
 * "What is breast augmentation recovery like?" The timeline gives the
 * milestones; the blog posts that rank for each recovery question (driving,
 * sleeping without a bra, push-ups) own the details and are linked, not
 * repeated. "Drop and fluff", one of her top questions, gets its own H3.
 */
export function BreastAugmentationRecovery() {
    return (
        <AnswerBlock
            id='recovery'
            question='What is breast augmentation recovery like?'
            className={moduleSectionPad}
            answer={`Most people are back at a desk job within a few days to a week and recover in ${figure('recover-1-2-weeks')}, The Aesthetic Society says. Cleveland Clinic advises no heavy lifting for at least ${figure('heavy-lifting-4-weeks')}, sports after up to ${figure('sports-6-weeks')}, and puts full recovery at about ${figure('full-recovery-6-8-weeks')}.`}
        >
            <ModuleTimeline
                label='Breast augmentation recovery timeline'
                milestones={milestones}
            />

            <h3 className={cn(moduleH3, 'mt-6')}>
                When do implants drop and fluff?
            </h3>
            <p className={cn(moduleBody, 'mt-3')}>
                Over the first weeks. ASPS says the final result may take a few
                weeks to show, as the swelling goes down and the skin stretches,
                and The Aesthetic Society says most remaining swelling resolves
                within a month. How fast your implants settle varies, and your
                surgeon checks it at your follow-up visits.{' '}
                <Link
                    href='/blog/breast-implants-drop-fluff-timeline'
                    className={moduleLink}
                >
                    Breast implants drop and fluff: the timeline
                </Link>
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
                    label: 'What to expect in the weeks after breast augmentation',
                    href: '/weeks-post-op-breast-augmentation-what-to-expect',
                }}
                guides={guides}
            />
        </AnswerBlock>
    )
}

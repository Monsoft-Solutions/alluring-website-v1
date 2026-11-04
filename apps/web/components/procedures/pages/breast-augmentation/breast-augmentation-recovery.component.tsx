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
import { KARLINSKY_SHORT_NAME } from '@/lib/data/surgeons/karlinsky-credentials.constant'

/**
 * Every figure is a fact in `breast-augmentation.facts.ts`, attributed the
 * way that file says it must be. The week marks are the same ones every post
 * in the breast augmentation blog cluster uses.
 */
const milestones: ModuleMilestone[] = [
    {
        when: 'Day of surgery',
        body: 'You go home once you are stable, typically after an hour or so (ASPS), with someone to drive you and stay with you the first night at least (Cleveland Clinic). Rest and sleep on your back, propped up, with your support bra or band on as your surgeon instructs.',
    },
    {
        when: `Days ${figure('pain-1-5-days').replace(' days', '')}`,
        body: `Acute pain typically eases after ${figure('pain-1-5-days')}, though soreness and swelling can last a few weeks (ASPS).`,
    },
    {
        when: 'A few days to a week',
        body: `Many people return to work, depending on the job (The Aesthetic Society). Cleveland Clinic says to take at least ${figure('time-off-cleveland')} off work, and at least ${figure('time-off-cleveland', 1)} for a physically demanding job.`,
    },
    {
        when: 'About a week',
        body: `Stitches that need removing come out (The Aesthetic Society; Cleveland Clinic). Many people can drive again after ${figure('driving-about-a-week')} (an article on the ASPS website), never on opioid pain medicine. MedlinePlus, on a page that also covers lifts and reductions, says not to drive for at least ${figure('driving-about-a-week', 2)}.`,
    },
    {
        when: `Weeks ${figure('recover-1-2-weeks').replace(' weeks', '')}`,
        body: 'Recovery typically takes this long, The Aesthetic Society says. Your surgeon sets when you return to normal activity.',
    },
    {
        when: `At least ${figure('sex-2-weeks')}`,
        body: 'Sex waits this long (The Aesthetic Society). Be gentle with your breasts for at least the next month.',
    },
    {
        when: `Weeks ${figure('back-sleep-3-4-weeks').replace(' weeks', '')}`,
        body: `A UW Medicine patient handout says to sleep on your back for this long, and it and University of Utah Health allow side sleeping after that, though your surgeon may ask for longer. Those two keep a support bra on around the clock for this long, and MedlinePlus, on a page that also covers lifts and reductions, says a bra night and day for ${figure('support-bra-3-4-weeks', 1)}. No source gives a date for going without a bra at night, so that waits until your surgeon clears you.`,
    },
    {
        when: `At least ${figure('heavy-lifting-4-weeks')}`,
        body: 'No heavy lifting before then (Cleveland Clinic). If you have small children, line up help with lifting them, and ask your surgeon when you can carry them again.',
    },
    {
        when: 'At least about a month',
        body: 'A bath, pool, hot tub or the ocean waits this long (an article on the ASPS website), and until your incisions are fully closed and your surgeon agrees.',
    },
    {
        when: `Around ${figure('chest-work-no-single-date')}`,
        body: `Returning to sports may take up to ${figure('sports-6-weeks')} (Cleveland Clinic). No source gives a single date for push-ups: an article on the ASPS website says to avoid strenuous activity and upper-body movement for at least ${figure('chest-work-no-single-date')}, and another says patients can resume all exercises at ${figure('chest-work-no-single-date')} but advises avoiding strenuous chest exercise such as push-ups, especially with implants under the muscle. Your surgeon decides.`,
    },
    {
        when: `Weeks ${figure('full-recovery-6-8-weeks').replace(' weeks', '')}`,
        body: 'Full recovery, on average (Cleveland Clinic).',
    },
    {
        when: `From about ${figure('drop-fluff-3-6-months')}`,
        body: `University of Utah Health says you begin to notice your final results around ${figure('drop-fluff-3-6-months')}, with subtle changes through ${figure('drop-fluff-3-6-months', 2)}. An article on the ASPS website says the whole drop and fluff process can take ${figure('drop-fluff-3-6-months', 1)}.`,
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
        label: 'What to expect in the weeks after surgery',
        href: '/weeks-post-op-breast-augmentation-what-to-expect',
    },
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
        label: 'When you can work out again',
        href: '/blog/when-can-you-work-out-after-breast-augmentation',
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
        label: 'Implant massage: whether you need it',
        href: '/how-often-to-massage-breast-after-augmentation',
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
 * repeated. "Drop and fluff", one of her top questions, gets its own H3, in the marks every post uses.
 */
export function BreastAugmentationRecovery() {
    return (
        <AnswerBlock
            id='recovery'
            question='What is breast augmentation recovery like?'
            className={moduleSectionPad}
            answer={`Many people can return to a desk job within a few days to a week and recover in ${figure('recover-1-2-weeks')}, The Aesthetic Society says. Cleveland Clinic advises no heavy lifting for at least ${figure('heavy-lifting-4-weeks')} and puts full recovery at about ${figure('full-recovery-6-8-weeks')}. An article on the ASPS website says drop and fluff can take ${figure('drop-fluff-3-6-months', 1)}.`}
        >
            <ModuleTimeline
                label='Breast augmentation recovery timeline'
                milestones={milestones}
            />

            <h3 className={cn(moduleH3, 'mt-6')}>
                When do implants drop and fluff?
            </h3>
            <p className={cn(moduleBody, 'mt-3')}>
                Implants sit high and look flat at first. University of Utah
                Health says you begin to notice your final results around{' '}
                {figure('drop-fluff-3-6-months')}, with subtle changes through{' '}
                {figure('drop-fluff-3-6-months', 2)}, and an article on the ASPS
                website says the whole drop and fluff process can take{' '}
                {figure('drop-fluff-3-6-months', 1)}. Your surgeon checks how
                yours are settling at your follow-up visits.{' '}
                <Link
                    href='/blog/breast-implants-drop-fluff-timeline'
                    className={moduleLink}
                >
                    Breast implant drop and fluff: timeline, week by week
                </Link>
            </p>

            <h3 className={cn(moduleH3, 'mt-8')}>
                If you are flying in from another state
            </h3>
            <p className={cn(moduleBody, 'mt-3')}>
                {KARLINSKY_SHORT_NAME} tells you, in writing, how many nights to
                stay in Miami before you fly home, and we confirm your surgery,
                pre-op and follow-up dates in writing. You arrange the travel
                itself.
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
                    label: 'Breast augmentation recovery, week by week',
                    href: '/blog/breast-augmentation-recovery-miami',
                }}
                guides={guides}
            />
        </AnswerBlock>
    )
}

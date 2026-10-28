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
import { breastLiftFigure } from '@/lib/data/procedures/facts/breast-lift.facts'

/**
 * Every figure is a fact in `breast-lift.facts.ts`, attributed the way that
 * file says it must be. A surgeon quoted in an ASPS article is named, because
 * the article gives her view, not the society's.
 */
const milestones: ModuleMilestone[] = [
    {
        when: 'Day of surgery',
        body: 'You usually go home the same day, in a surgical bra or dressing (Cleveland Clinic). Someone drives you home and stays with you for at least the first night, as ASPS advises. If you have young children, have someone care for them for at least the first week (The Aesthetic Society).',
    },
    {
        when: `First ${breastLiftFigure('sore-2-5-days')}`,
        body: 'Your chest may feel stiff and sore (The Aesthetic Society). Sleep on your back, and keep your elbows by your sides rather than reaching overhead, as your surgeon advises (Cleveland Clinic).',
    },
    {
        when: 'About a week',
        body: 'Most people go back to desk work and gentle activity, such as walking. After the first week, the surgical bra gives way to a support bra, worn for several weeks (Cleveland Clinic).',
    },
    {
        when: `First ${breastLiftFigure('no-lifting-2-weeks')}`,
        body: 'No lifting, driving, laundry or cleaning (The Aesthetic Society), while the swelling and bruising ease (Cleveland Clinic).',
    },
    {
        when: `Up to ${breastLiftFigure('vigorous-up-to-6-weeks')}`,
        body: 'Lifting, exercise and sex wait until your surgeon clears them (Cleveland Clinic).',
    },
    {
        when: `About ${breastLiftFigure('regular-bra-8-weeks')}`,
        body: `Most women can wear a regular bra again (Cleveland Clinic). Karen Horton, MD, quoted on the ASPS website, advises no underwire for at least ${breastLiftFigure('regular-bra-8-weeks', 1)}.`,
    },
    {
        when: 'A few months',
        body: 'The breasts settle into their final shape and position (ASPS).',
    },
    {
        when: `Up to ${breastLiftFigure('scar-fades-1-year')}`,
        body: 'Numbness in the nipples has usually returned, though for some it takes up to a year (Cleveland Clinic). The scars, pink for many months (The Aesthetic Society), have done most of their fading (Cleveland Clinic).',
    },
]

const guides: ModuleGuide[] = [
    {
        label: 'Breast lift scars: where they sit and how they fade',
        href: '/blog/breast-lift-scars-miami',
    },
    {
        label: 'How to prepare for a breast lift',
        href: '/blog/breast-lift-prep-miami',
    },
    {
        label: 'Sleeping on your side after breast surgery',
        href: '/when-can-i-sleep-on-my-side-after-breast-reduction',
    },
    {
        label: 'A breast lift after weight loss',
        href: '/blog/breast-lift-recovery-weight-loss-miami',
    },
]

/**
 * "What is breast lift recovery like?" The timeline gives the milestones;
 * the blog posts that rank for each recovery question (scars, sleeping,
 * weight loss) own the details and are linked, not repeated. The scars,
 * breastfeeding and how long a lift lasts, three of her top questions, get
 * their own H3s here.
 */
export function BreastLiftRecovery() {
    return (
        <AnswerBlock
            id='recovery'
            question='What is breast lift recovery like?'
            className={moduleSectionPad}
            answer={`Most people go back to desk work in about a week and have swelling and bruising for about ${breastLiftFigure('swelling-2-weeks')}. Lifting, exercise and sex usually wait up to ${breastLiftFigure('vigorous-up-to-6-weeks')}, a regular bra about ${breastLiftFigure('regular-bra-8-weeks')}, and the scars fade most in about a year, according to Cleveland Clinic and The Aesthetic Society.`}
        >
            <ModuleTimeline
                label='Breast lift recovery timeline'
                milestones={milestones}
            />

            <h3 className={cn(moduleH3, 'mt-6')}>Where will my scars be?</h3>
            <p className={cn(moduleBody, 'mt-3')}>
                It depends on your lift: around the areola, then down to the
                breast crease, and along the crease for the most lift (ASPS; The
                Aesthetic Society). Cleveland Clinic says almost all breast lift
                scars sit at the border of the areola, in the breast crease or
                along the breast&apos;s natural contours, though some show on
                the surface. They are permanent, but they fade a lot, most of it
                in about {breastLiftFigure('scar-fades-1-year')}.
            </p>

            <h3 className={cn(moduleH3, 'mt-8')}>
                Can I breastfeed after a breast lift?
            </h3>
            <p className={cn(moduleBody, 'mt-3')}>
                Often, yes, but it isn&apos;t certain. With the usual techniques
                the nipple and areola stay attached to the tissue beneath them,
                which preserves sensation and the ability to breastfeed (The
                Aesthetic Society), and many women have breastfed after a lift
                (Shahram Salemy, MD, on the ASPS website). Cleveland Clinic
                lists difficulty breastfeeding among the risks, and CDC notes
                that after breast surgery most mothers can make some milk,
                though not always a full supply.
            </p>

            <h3 className={cn(moduleH3, 'mt-8')}>
                How long does a breast lift last?
            </h3>
            <p className={cn(moduleBody, 'mt-3')}>
                ASPS calls the results long-lasting, though your breasts keep
                changing with age and gravity. A stable weight helps them last,
                and a pregnancy can undo much of the lift. In a study of{' '}
                {breastLiftFigure('sagging-risk-factors')}, the number of
                pregnancies and significant weight loss were linked to sagging,
                but breastfeeding was not (Rinker and colleagues, Annals of
                Plastic Surgery, 2010).
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
                    label: 'Breast lift recovery, week by week',
                    href: '/blog/breast-lift-recovery-guide-miami',
                }}
                guides={guides}
            />
        </AnswerBlock>
    )
}

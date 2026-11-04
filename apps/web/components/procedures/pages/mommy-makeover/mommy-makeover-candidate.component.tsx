import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'

import {
    ModuleCandidate,
    type ModuleCandidateAlternative,
} from '@/components/procedures/module-kit/module-candidate.component'
import {
    moduleBody,
    moduleH3,
    moduleLink,
} from '@/components/procedures/module-kit/module-ui.constant'
import { mommyMakeoverFigure } from '@/lib/data/procedures/facts/mommy-makeover.facts'
import { KARLINSKY_SHORT_NAME } from '@/lib/data/surgeons/karlinsky-credentials.constant'

import { MommyMakeoverAnchor } from './mommy-makeover-anchor.component'
import { mommyMakeoverImages } from './mommy-makeover-page.constant'
import { MommyMakeoverPhoto } from './mommy-makeover-photo.component'

/** The figure as the sentence uses it: "under 30". */
const BMI_LIMIT = mommyMakeoverFigure('bmi-recommended-range').replace(
    'BMI ',
    ''
)

const suits = [
    'Your breasts and your abdomen have both changed since pregnancy',
    `Your weight has been close to your goal for ${mommyMakeoverFigure('stable-weight-6-12-months')}, the time Paul Vitenas, MD, on the ASPS website, gives before a tummy tuck`,
    `You don't smoke, or can stop: Cleveland Clinic says for at least ${mommyMakeoverFigure('nonsmoker')} before surgery`,
    "You're in good overall health, without untreated conditions such as diabetes or heart disease (The Aesthetic Society)",
    "You're done having children",
    'You have realistic expectations, and you know it leaves scars',
]

const elsewhere: ModuleCandidateAlternative[] = [
    {
        concern: 'You may want another pregnancy',
        body: 'ASPS advises postponing a tummy tuck, and The Aesthetic Society says pregnancy or weight gain afterward may compromise your results.',
    },
    {
        concern: 'Only your abdomen bothers you',
        body: 'A tummy tuck on its own may be all you need.',
        link: {
            label: 'Tummy tuck in Miami',
            href: '/procedures/tummy-tuck-miami',
        },
    },
    {
        concern: 'Only your breasts bother you',
        body: (
            <>
                A{' '}
                <Link
                    href='/procedures/breast-augmentation-miami'
                    className={moduleLink}
                >
                    breast augmentation
                </Link>{' '}
                or{' '}
                <Link
                    href='/procedures/breast-lift-miami'
                    className={moduleLink}
                >
                    breast lift
                </Link>{' '}
                on its own may be enough.
            </>
        ),
    },
    {
        concern: 'Your skin is firm and fat is the main concern',
        body: "Liposuction removes fat but doesn't remove or tighten skin.",
        link: {
            label: 'Liposuction in Miami',
            href: '/procedures/liposuction-miami',
        },
    },
    {
        concern: 'You are still losing weight',
        body: '"These are not weight loss surgeries," says Nneamaka Nwubah, MD, quoted by ASPS. Wait until your weight settles.',
    },
]

/**
 * "Am I a good candidate for a mommy makeover?" Answers the question that
 * decides whether she books at all, including when another procedure or waiting
 * suits her better. It takes over from the retired candidate checklist post,
 * whose old anchor still lands here. The layout is the kit's `ModuleCandidate`.
 *
 * Timing after birth is two named surgeons' views, not a society's rule, so
 * each is attributed. The BMI line repeats `/bmi-calculator`'s recommendation;
 * a BMI rule of the practice's own waits on the owner.
 */
export function MommyMakeoverCandidate() {
    return (
        <div>
            <MommyMakeoverAnchor id='am-i-a-good-candidate' />
            <ModuleCandidate
                question='Am I a good candidate for a mommy makeover?'
                answer="ASPS describes mommy makeover candidates as women in good medical health, at their ideal body weight, finished with childbearing and with a positive outlook and realistic expectations. A stable weight, not smoking and enough time since your last baby matter too. Your surgeon tells you at your consultation, including when it isn't the right choice."
                suitsHeading='A mommy makeover may suit you if'
                suits={suits}
                elsewhere={elsewhere}
            >
                <div className='mt-10 flex flex-col gap-8 md:mt-11 md:flex-row md:items-start md:gap-10'>
                    <div className='min-w-0 md:flex-1'>
                        <h3 className={moduleH3}>
                            How soon after having a baby?
                        </h3>
                        <p className={cn(moduleBody, 'mt-3.5')}>
                            There is no one rule. Kristy Hamilton, MD, quoted by
                            ASPS, tells patients to wait at least{' '}
                            {mommyMakeoverFigure('timing-delivery')} after
                            delivery, longer if their body is still changing,
                            and to have stopped breastfeeding for at least{' '}
                            {mommyMakeoverFigure('timing-breastfeeding')},
                            preferably{' '}
                            {mommyMakeoverFigure('timing-breastfeeding', 1)}.
                            Nneamaka Nwubah, MD, also quoted by ASPS, calls{' '}
                            {mommyMakeoverFigure('timing-delivery', 1)} the
                            sweet spot. {KARLINSKY_SHORT_NAME} looks at where
                            you are at your consultation.
                        </p>
                        <h3 className={cn(moduleH3, 'mt-8')}>
                            Does my weight or BMI matter?
                        </h3>
                        <p className={cn(moduleBody, 'mt-3.5')}>
                            We recommend a BMI under {BMI_LIMIT} before a mommy
                            makeover: where the published evidence turns, not a
                            cutoff of our own. Your surgeon decides case by
                            case.{' '}
                            <Link
                                href='/bmi-calculator#mommy-makeover'
                                className={moduleLink}
                            >
                                Check your BMI
                            </Link>
                        </p>
                    </div>
                    <MommyMakeoverPhoto
                        image={mommyMakeoverImages.questions}
                        arch
                    />
                </div>
            </ModuleCandidate>
        </div>
    )
}

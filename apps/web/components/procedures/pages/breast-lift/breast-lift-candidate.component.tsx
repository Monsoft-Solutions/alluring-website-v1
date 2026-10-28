import {
    ModuleCandidate,
    type ModuleCandidateAlternative,
} from '@/components/procedures/module-kit/module-candidate.component'
import { breastLiftFigure } from '@/lib/data/procedures/facts/breast-lift.facts'

/** ASPS's candidate list, in her words. */
const suits = [
    'Your breasts have dropped or flattened after pregnancy, nursing, weight loss or with age',
    'Your nipples sit below the breast crease, or point down',
    'One breast sits lower than the other, or your areolas have stretched',
    "Your weight is stable and you don't smoke",
    "You're done having children",
]

const elsewhere: ModuleCandidateAlternative[] = [
    {
        concern: "You want fuller breasts, and they haven't dropped",
        body: 'Implants alone may be enough. A lift changes position and shape; implants add size.',
        link: {
            label: 'Breast augmentation in Miami',
            href: '/procedures/breast-augmentation-miami',
        },
    },
    {
        concern: 'Your breasts feel too large or heavy',
        body: 'A breast reduction makes them smaller and lighter, and is planned as a different surgery.',
        link: {
            label: 'Breast reduction in Miami',
            href: '/procedures/breast-reduction-miami',
        },
    },
    {
        concern: 'Your abdomen changed after pregnancy too',
        body: 'A breast lift and a tummy tuck planned together is a mommy makeover, in one surgery or two.',
        link: {
            label: 'Mommy makeover in Miami',
            href: '/procedures/mommy-makeover-miami',
        },
    },
    {
        concern: 'You may want another pregnancy',
        body: 'ASPS advises waiting until you are done, because pregnancy can minimize or reverse the lift.',
    },
    {
        concern: 'You are breastfeeding, or stopped recently',
        body: `Shahram Salemy, MD, writing on the ASPS website, suggests waiting up to ${breastLiftFigure('wait-after-breastfeeding-6-months')} after breastfeeding stops, so the breasts settle into their final shape.`,
    },
    {
        concern: 'You are still losing weight',
        body: 'Including on a weight-loss medication: ASPS says significant weight loss after surgery can change the result, so wait until your weight is stable.',
    },
]

/**
 * "Am I a good candidate for a breast lift?" Answers the question that
 * decides whether she books a breast lift consultation at all, including
 * when implants alone, a reduction or a mommy makeover suits her better, or
 * when waiting does. The comparison posts are linked, not repeated. The
 * layout is the kit's `ModuleCandidate`; the copy is this page's.
 */
export function BreastLiftCandidate() {
    return (
        <ModuleCandidate
            question='Am I a good candidate for a breast lift?'
            answer="You may be if your breasts have dropped or lost their shape, your nipples sit below the breast crease or point down, your weight is stable, you don't smoke and you're done having children. ASPS describes candidates this way. Your surgeon confirms it at an exam, including when another procedure suits you better."
            suitsHeading='A breast lift may suit you if'
            suits={suits}
            elsewhere={elsewhere}
            guides={[
                {
                    label: 'Breast augmentation or breast lift: which do you need?',
                    href: '/blog/breast-augmentation-vs-breast-lift',
                },
                {
                    label: 'Breast lift or breast reduction: how to tell',
                    href: '/blog/breast-lift-vs-reduction-miami',
                },
                {
                    label: 'A breast lift after pregnancy',
                    href: '/blog/breast-lift-miami-post-pregnancy',
                },
                {
                    label: 'Breast lift candidate checklist',
                    href: '/blog/breast-lift-candidate-checklist',
                },
            ]}
        />
    )
}

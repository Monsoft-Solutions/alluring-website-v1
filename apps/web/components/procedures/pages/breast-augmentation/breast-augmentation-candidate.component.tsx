import {
    ModuleCandidate,
    type ModuleCandidateAlternative,
} from '@/components/procedures/module-kit/module-candidate.component'
import { breastAugmentationFigure as figure } from '@/lib/data/procedures/facts/breast-augmentation.facts'

const suits = [
    'You feel your breasts are too small',
    'Your breasts lost shape and volume after pregnancy, weight loss or with age',
    'The upper part of your breasts looks empty',
    "Your breasts are uneven, or one or both didn't develop fully",
    "You're healthy, your breasts are fully developed and your expectations are realistic",
    `You meet the FDA's approved ages: ${figure('fda-ages')} or older for saline implants, ${figure('fda-ages', 1)} or older for silicone`,
]

const elsewhere: ModuleCandidateAlternative[] = [
    {
        concern: 'Your breasts sag, and you want them higher',
        body: "ASPS says implants don't correct severely drooping breasts. Implants with a lift are a breast lift, sometimes done in the same surgery.",
        link: {
            label: 'Breast lift in Miami',
            href: '/procedures/breast-lift-miami',
        },
    },
    {
        concern: 'You want smaller, lighter breasts',
        body: 'That is the opposite surgery. A breast reduction removes skin and tissue to make the breasts smaller, and ASPS says it can ease back pain from heavy breasts.',
        link: {
            label: 'Breast reduction in Miami',
            href: '/procedures/breast-reduction-miami',
        },
    },
    {
        concern: 'After children, your abdomen changed too',
        body: 'Breast surgery and a tummy tuck planned together are a mommy makeover.',
        link: {
            label: 'Mommy makeover in Miami',
            href: '/procedures/mommy-makeover-miami',
        },
    },
    {
        concern:
            'You are pregnant or nursing, or have an active infection or untreated breast cancer',
        body: "The FDA's example patient checklist says you are not a candidate for implants during any of these, so surgery waits.",
    },
]

/**
 * "Am I a good candidate for breast augmentation?" Who it may suit, from
 * ASPS's own list, and when a breast lift, a reduction, a mommy makeover or
 * waiting suits her better, each linked to its page. It also carries the
 * short, honest answer to augmentation vs reduction, which folds into this
 * page from `/blog/breast-augmentation-vs-reduction-miami`.
 *
 * The practice's own candidacy limits and age policy wait on the owner, so
 * the ages are the FDA's. The quiz owns the full checklist, and takes the
 * other candidacy posts' folds.
 */
export function BreastAugmentationCandidate() {
    return (
        <ModuleCandidate
            question='Am I a good candidate for breast augmentation?'
            answer="You may be if you're healthy, not pregnant or breastfeeding, your breasts are fully developed and your expectations are realistic, ASPS says. Many candidates want more size, want volume back after pregnancy or weight loss, or want more even breasts. Your surgeon confirms it at an exam, including when another procedure suits you better."
            suitsHeading='Breast augmentation may suit you if'
            suits={suits}
            elsewhere={elsewhere}
            guides={[
                {
                    label: 'Am I a candidate for breast augmentation? Take the quiz',
                    href: '/blog/breast-augmentation-candidate-quiz',
                },
                {
                    label: 'Breast augmentation or a breast lift: which do you need?',
                    href: '/blog/breast-augmentation-vs-breast-lift',
                },
            ]}
        />
    )
}

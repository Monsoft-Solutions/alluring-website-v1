import {
    ModuleCandidate,
    type ModuleCandidateAlternative,
} from '@/components/procedures/module-kit/module-candidate.component'
import { tummyTuckFigure } from '@/lib/data/procedures/facts/tummy-tuck.facts'

const suits = [
    "Loose skin on your abdomen that diet and exercise haven't changed",
    'A pouch after pregnancy, from muscles that have separated',
    `Your weight has been close to your goal for ${tummyTuckFigure('stable-weight-6-12-months')}`,
    "You don't smoke, or can stop before and after surgery",
    "You're done having children",
]

const elsewhere: ModuleCandidateAlternative[] = [
    {
        concern: 'The skin is firm and fat is the main concern',
        body: "Liposuction removes fat but doesn't remove or tighten skin. If your skin is firm, it may be all you need.",
        link: {
            label: 'Liposuction in Miami',
            href: '/procedures/liposuction-miami',
        },
    },
    {
        concern: 'Your breasts changed after pregnancy too',
        body: 'A tummy tuck and breast surgery planned together is a mommy makeover, in one surgery or two.',
        link: {
            label: 'Mommy makeover in Miami',
            href: '/procedures/mommy-makeover-miami',
        },
    },
    {
        concern: 'You may want another pregnancy',
        body: 'ASPS advises waiting until you are done, because weight changes can undo much of the result.',
    },
    {
        concern: 'You are still losing weight',
        body: 'Including on a weight-loss medication such as a GLP-1: wait until your weight settles, so the surgery is planned around your settled shape.',
    },
]

/**
 * "Am I a good candidate for a tummy tuck?" Answers the question that decides
 * whether she books a tummy tuck consultation at all, including when
 * liposuction or a mommy makeover suits her better. The comparison posts
 * are linked, not repeated. The layout is the kit's `ModuleCandidate`; the
 * copy is this page's.
 */
export function TummyTuckCandidate() {
    return (
        <ModuleCandidate
            question='Am I a good candidate for a tummy tuck?'
            answer="You may be if loose skin or separated muscles remain after pregnancy or weight loss, your weight has settled, you don't smoke and you're done having children. ASPS describes candidates as healthy, at a stable weight and nonsmokers. Your surgeon confirms it at an exam, including when another procedure suits you better."
            suitsHeading='A tummy tuck may suit you if'
            suits={suits}
            elsewhere={elsewhere}
            guides={[
                {
                    label: 'Tummy tuck or liposuction: how to tell which you need',
                    href: '/blog/tummy-tuck-vs-liposuction',
                },
                {
                    label: 'Tummy tuck or mommy makeover: which one do you need?',
                    href: '/blog/tummy-tuck-mommy-makeover-miami',
                },
                {
                    label: 'Separated muscles after pregnancy and the tummy tuck',
                    href: '/blog/tummy-tuck-diastasis-recti-miami',
                },
            ]}
        />
    )
}

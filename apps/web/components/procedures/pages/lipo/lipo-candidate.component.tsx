import {
    ModuleCandidate,
    type ModuleCandidateAlternative,
} from '@/components/procedures/module-kit/module-candidate.component'
import { lipoFigure } from '@/lib/data/procedures/facts/lipo.facts'

const suits = [
    'Fat stays in one or a few areas despite diet and exercise',
    'Your weight has been stable for a while',
    'Your skin is firm and elastic',
    "You don't smoke or vape",
    'You want a change in shape, not on the scale',
]

const elsewhere: ModuleCandidateAlternative[] = [
    {
        concern: 'Loose skin is the main concern',
        body: 'Liposuction removes fat but does not tighten skin. A tummy tuck or an arm lift removes the skin itself.',
        link: {
            label: 'Tummy tuck in Miami',
            href: '/procedures/tummy-tuck-miami',
        },
    },
    {
        concern: 'You plan to lose a lot of weight',
        body: 'The Aesthetic Society advises waiting until you have, so the result is planned around your settled shape.',
    },
    {
        concern: 'Cellulite is the main concern',
        body: 'ASPS says liposuction is not an effective treatment for cellulite.',
    },
    {
        concern: 'Your abdomen changed after pregnancy',
        body: 'Loose skin and separated muscles need more than liposuction. A tummy tuck or a mommy makeover may suit you better.',
        link: {
            label: 'Mommy makeover in Miami',
            href: '/procedures/mommy-makeover-miami',
        },
    },
]

/**
 * "Am I a good candidate for liposuction?" Answers the question that decides
 * whether she books a liposuction consultation at all, including when
 * another procedure suits her better. The blog post that owns the full
 * checklist, and the tummy-tuck comparison, are linked, not repeated. The
 * layout is the kit's `ModuleCandidate`; the copy is this page's.
 */
export function LipoCandidate() {
    return (
        <ModuleCandidate
            question='Am I a good candidate for liposuction?'
            answer={`You may be, if you are close to a stable, healthy weight, have firm, elastic skin and don't smoke. ASPS describes ideal candidates as adults within ${lipoFigure('asps-within-30-percent')} of their ideal weight. Liposuction is not a treatment for obesity, and it removes fat without tightening loose skin. Your surgeon confirms it at an exam.`}
            suitsHeading='Liposuction may suit you if'
            suits={suits}
            elsewhere={elsewhere}
            guides={[
                {
                    label: 'Tummy tuck or liposuction: how to tell which you need',
                    href: '/blog/tummy-tuck-vs-liposuction',
                },
            ]}
        />
    )
}

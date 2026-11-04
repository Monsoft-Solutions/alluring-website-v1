import {
    ModuleSceneSection,
    type ModuleSceneEvidence,
    type ModuleSceneItem,
} from '@/components/procedures/module-kit/module-scene.component'
import { mommyMakeoverFigure } from '@/lib/data/procedures/facts/mommy-makeover.facts'

import { MommyMakeoverPlanDiagram } from './mommy-makeover-plan-diagram.component'

const law: ModuleSceneItem[] = [
    {
        title: `No more than ${mommyMakeoverFigure('florida-8-hours')} of surgery in an office`,
        body: "In a doctor's office, the planned length of all procedures in one cosmetic surgery may not exceed that, which limits how much can be combined.",
    },
    {
        title: `At most ${mommyMakeoverFigure('florida-1000cc')} of liposuction with a tummy tuck`,
        body: 'When liposuction is combined with a tummy tuck in the same office operation, that is the most supernatant fat Florida allows it to remove: the fat alone, once the fluid removed with it has separated out.',
    },
    {
        title: `Discharged within ${mommyMakeoverFigure('florida-discharge-24-hours')}`,
        body: "After cosmetic surgery in a doctor's office, Florida requires that you be discharged within that time of arriving.",
    },
    {
        title: 'The hospital, in writing',
        body: 'Before office surgery under sedation or general anesthesia, your surgeon must give you, in writing, the name and location of the hospital where they have privileges or a transfer agreement.',
    },
]

const evidence: ModuleSceneEvidence[] = [
    {
        title: 'A tummy tuck with breast surgery',
        body: `A 2026 review of ${mommyMakeoverFigure('combined-meta-2026')} found the risk of a tummy tuck with breast surgery comparable to a tummy tuck alone and higher than breast surgery alone, and concluded that it is generally safe in carefully selected patients. It rates its own evidence moderate to very low in certainty (Skorochod and Wolf, Aesthetic Plastic Surgery, 2026).`,
        sourceId: 'skorochod-wolf-2026',
    },
    {
        title: 'Blood clots',
        body: `Among ${mommyMakeoverFigure('vte-combined')} having cosmetic surgery, blood clots within ${mommyMakeoverFigure('vte-combined', 1)} followed ${mommyMakeoverFigure('vte-combined', 2)} of combined procedures and ${mommyMakeoverFigure('vte-combined', 3)} of single ones, and ${mommyMakeoverFigure('vte-combined', 4)} of combined body and breast procedures, the highest rate the study lists. The study calls the overall rate relatively low (Winocour and colleagues, Aesthetic Surgery Journal, 2017).`,
        sourceId: 'winocour-2017',
    },
    {
        title: 'Length of surgery',
        body: `In a study of complex plastic surgery at one US medical center, each extra hour of surgery raised the odds of a complication by ${mommyMakeoverFigure('operative-time')}, and risk rose once surgery passed ${mommyMakeoverFigure('operative-time', 1)} (Hardy and colleagues, Aesthetic Surgery Journal, 2014). It wasn't a study of mommy makeovers, and it says nothing about how long yours takes: your surgeon tells you that.`,
        sourceId: 'hardy-2014',
    },
    {
        title: 'What the complications were',
        body: `Of the major complications in the ${mommyMakeoverFigure('major-complications')} above, ${mommyMakeoverFigure('complication-types')} were hematomas (bleeding under the skin), ${mommyMakeoverFigure('complication-types', 1)} infections and ${mommyMakeoverFigure('complication-types', 2)} suspected or confirmed blood clots. Risk was higher at ${mommyMakeoverFigure('risk-factors').toLowerCase()} or older, with a BMI of ${mommyMakeoverFigure('risk-factors', 1).replace('BMI ', '')} or more, and when several procedures were combined (Winocour and colleagues, 2015).`,
        sourceId: 'winocour-2015',
    },
]

/** The questions the retired "questions to ask" post held, for any surgeon. */
const checklist = [
    "Who performs my surgery, and which board certifies them? Then check that certification on the board's own website, not the clinic's.",
    'Which procedures does my plan include, and why each one?',
    'How long will my surgery take, and when would you split a plan into two surgeries?',
    'What do you do to prevent blood clots, before and after surgery?',
    'Where will my surgery take place, and who gives the anesthesia?',
    'If it is in an office, which hospital will you name in writing?',
    'What exactly does my quote include, line by line?',
    'How many nights should I stay in Miami before I fly home?',
]

/**
 * "Is a mommy makeover safe?" The page's one dark band and its signature scene,
 * `MommyMakeoverPlanDiagram`, laid out by the kit's `ModuleSceneSection`.
 *
 * The law is stated as the law, and the research as the research. Where
 * Alluring operates, how long a plan takes there and its plan to prevent blood
 * clots wait on the owner, so the copy never claims the practice's own; the
 * checklist asks readers to put those questions to every surgeon, ours
 * included. It takes over from the retired questions post.
 */
export function MommyMakeoverSafety() {
    return (
        <ModuleSceneSection
            question='Is a mommy makeover safe?'
            answer={
                <>
                    Every surgery carries risk, and combining procedures adds
                    some. In an insurance database of{' '}
                    {mommyMakeoverFigure('major-complications')}, major
                    complications followed{' '}
                    {mommyMakeoverFigure('major-complications', 1)} of tummy
                    tucks done alone,{' '}
                    {mommyMakeoverFigure('major-complications', 3)} of those
                    with a breast procedure and{' '}
                    {mommyMakeoverFigure('major-complications', 4)} of those
                    with liposuction and a breast procedure (Winocour and
                    colleagues, 2015). Your plan&apos;s parts and length are
                    what you and your surgeon weigh.
                </>
            }
            diagram={<MommyMakeoverPlanDiagram />}
            tabularFigures
            law={{
                heading: 'What Florida law sets for office surgery',
                sources: [
                    {
                        label: 'Florida Administrative Code 64B8-9.009',
                        sourceId: 'florida-rule-64b8-9-009',
                    },
                ],
                items: law,
            }}
            evidence={{
                items: evidence,
                link: {
                    label: 'Warning signs in mommy makeover recovery, week by week',
                    href: '/blog/mommy-makeover-recovery-signs',
                },
            }}
            checklist={{
                heading:
                    'Questions to ask any mommy makeover surgeon, including us',
                questions: checklist,
                note: "Bring this list to your consultation, and she answers each question before you decide anything. Her credentials are below, each one linked to the issuing body's own record.",
            }}
        />
    )
}

import {
    ModuleSceneSection,
    type ModuleSceneEvidence,
    type ModuleSceneItem,
} from '@/components/procedures/module-kit/module-scene.component'
import { breastLiftFigure } from '@/lib/data/procedures/facts/breast-lift.facts'

import { BreastLiftPatternsDiagram } from './breast-lift-patterns.component'

const law: ModuleSceneItem[] = [
    {
        title: `No more than ${breastLiftFigure('florida-8-hours')} of surgery in an office`,
        body: "In a doctor's office, Florida caps the planned length of all procedures in one cosmetic surgery, which limits how much can be combined.",
    },
    {
        title: `Discharged within ${breastLiftFigure('florida-discharge-24-hours')}`,
        body: "After cosmetic surgery in a doctor's office, Florida requires that you be discharged within that time of arriving.",
    },
    {
        title: 'The hospital, in writing',
        body: 'Before office surgery under sedation or general anesthesia, your surgeon must give you, in writing, the name and location of the hospital where they have privileges or a transfer agreement.',
    },
    {
        title: 'With implants, a checklist you both sign',
        body: 'Since 2021, breast implants carry an FDA boxed warning, and your surgeon must review the FDA patient decision checklist with you before surgery, for you both to sign.',
    },
    {
        title: 'Implant ages set by the FDA',
        body: `The FDA approves saline implants for cosmetic breast surgery from ${breastLiftFigure('fda-ages')} and silicone gel implants from ${breastLiftFigure('fda-ages', 1)}.`,
    },
]

const evidence: ModuleSceneEvidence[] = [
    {
        title: 'Soon after surgery',
        body: `In a national surgical database, complications within ${breastLiftFigure('thirty-day-complications')} followed ${breastLiftFigure('thirty-day-complications', 1)} of breast lifts alone and ${breastLiftFigure('thirty-day-complications', 2)} of lifts with implants, and reoperations were similar, ${breastLiftFigure('thirty-day-complications', 3)} for a lift alone against ${breastLiftFigure('thirty-day-complications', 2)} with implants (Ali and colleagues, Annals of Plastic Surgery, 2021).`,
        sourceId: 'ali-2021',
    },
    {
        title: 'A lift without implants',
        body: `A 2019 review of ${breastLiftFigure('lift-alone-review')} and ${breastLiftFigure('lift-alone-review', 1)} who had a lift without implants found complications in ${breastLiftFigure('lift-alone-review', 2)}, most often scar problems (${breastLiftFigure('lift-alone-review', 3)}) and nipple and areola problems such as asymmetry or reduced sensation (${breastLiftFigure('lift-alone-review', 4)}) (di Summa and colleagues, Journal of Plastic, Reconstructive & Aesthetic Surgery, 2019).`,
        sourceId: 'di-summa-2019',
    },
    {
        title: 'A lift with implants',
        body: `A 2014 review of ${breastLiftFigure('lift-with-implants-review')} found that ${breastLiftFigure('lift-with-implants-review', 1)} of patients had another operation after a lift with implants in one surgery, most often because the breast sagged again (${breastLiftFigure('lift-with-implants-review', 2)}). Most of its studies followed patients for under ${breastLiftFigure('lift-with-implants-review', 4)} (Khavanin and colleagues, Plastic and Reconstructive Surgery, 2014).`,
        sourceId: 'khavanin-2014',
    },
    {
        title: 'One surgery or two',
        body: `In one practice's review, reoperations after a lift with implants in one surgery (${breastLiftFigure('one-or-two-surgeries')}) were no more than the two operations' risks added together; after a lift alone, ${breastLiftFigure('one-or-two-surgeries', 1)} had a reoperation (Calobrace and colleagues, Plastic and Reconstructive Surgery, 2013). With more sagging, two surgeries can be the safer plan (Jaime Schwartz, MD, on the ASPS website).`,
        sourceId: 'calobrace-2013',
    },
    {
        title: 'Nipple sensation',
        body: `Numbness in the nipples and breasts usually returns over a few weeks or months; some people are numb for up to ${breastLiftFigure('sensation-up-to-1-year')}, and rarely the loss is permanent (Cleveland Clinic).`,
        sourceId: 'cleveland-clinic-breast-lift-center',
    },
]

const checklist = [
    'Which lift do I need, and where will each scar sit?',
    'Will a lift alone give me the shape I want, or do I need implants?',
    'If I add implants, will it be one surgery or two, and why?',
    'Saline or silicone, and will you go through the FDA checklist with me?',
    'How could this affect nipple sensation, and breastfeeding later?',
    'Where will my surgery take place, and who gives the anesthesia?',
    'If it is in an office, which hospital will you name in writing?',
    "Which board certifies you? Then check that certification on the board's own website, not the clinic's.",
]

/**
 * "Is a breast lift safe?" The page's one dark band and its signature scene:
 * the four incisions, from the shortest scar to the longest, beside how
 * often a lift goes wrong and what Florida law and the FDA set. Laid out by
 * the kit's `ModuleSceneSection`: the drawing sits between the answer and
 * the law on phones, and stays pinned beside the reading column from `lg`.
 *
 * The law is stated as the law, and the research as the research. Where
 * Alluring operates, which implants it uses and whether it stages a lift
 * with implants wait on the owner, so the copy never claims the practice's
 * own; the checklist asks readers to put those questions to every surgeon,
 * ours included.
 */
export function BreastLiftSafety() {
    return (
        <ModuleSceneSection
            question='Is a breast lift safe?'
            answer={
                <>
                    The Aesthetic Society says serious complications are
                    infrequent. In a national surgical database, complications
                    within {breastLiftFigure('thirty-day-complications')}{' '}
                    followed {breastLiftFigure('thirty-day-complications', 1)}{' '}
                    of breast lifts alone and{' '}
                    {breastLiftFigure('thirty-day-complications', 2)} of lifts
                    with implants. The longer-term trade-offs are the scars,
                    changes in nipple sensation and the breast sagging again,
                    which is why the lift you need, and whether to add implants,
                    matters.
                </>
            }
            diagram={<BreastLiftPatternsDiagram />}
            tabularFigures
            law={{
                heading: 'What Florida law and the FDA set',
                sources: [
                    {
                        label: 'Florida Administrative Code 64B8-9.009',
                        sourceId: 'florida-rule-64b8-9-009',
                    },
                    {
                        label: 'FDA breast implant labeling',
                        sourceId: 'fda-things-to-consider',
                    },
                ],
                items: law,
            }}
            evidence={{
                items: evidence,
                link: {
                    label: 'Breast lift scars: where they sit and how they heal',
                    href: '/blog/breast-lift-scars-miami',
                },
            }}
            checklist={{
                heading:
                    'Questions to ask any breast lift surgeon, including us',
                questions: checklist,
            }}
        />
    )
}

import {
    ModuleSceneSection,
    type ModuleSceneEvidence,
    type ModuleSceneItem,
} from '@/components/procedures/module-kit/module-scene.component'
import { tummyTuckFigure } from '@/lib/data/procedures/facts/tummy-tuck.facts'

const law: ModuleSceneItem[] = [
    {
        title: `At most ${tummyTuckFigure('florida-lipo-with-tummy-tuck-1000cc')} of liposuction with a tummy tuck`,
        body: 'When liposuction is combined with a tummy tuck in the same office operation, that is the most supernatant fat Florida allows it to remove: the fat alone, once the fluid removed with it has separated out. A BBL takes its fat from liposuction, so the same limit shapes whether both fit in one surgery.',
    },
    {
        title: `No more than ${tummyTuckFigure('florida-8-hours')} of surgery in an office`,
        body: "In a doctor's office, the planned length of all procedures in one cosmetic surgery may not exceed that, which limits how much can be combined.",
    },
    {
        title: `Discharged within ${tummyTuckFigure('florida-discharge-24-hours')}`,
        body: "After cosmetic surgery in a doctor's office, Florida requires that you be discharged within that time of arriving.",
    },
    {
        title: 'The hospital, in writing',
        body: 'Before office surgery under sedation or general anesthesia, your surgeon must give you, in writing, the name and location of the hospital where they have privileges or a transfer agreement.',
    },
]

const evidence: ModuleSceneEvidence[] = [
    {
        title: 'How often serious problems happen',
        body: `In an insurance database of ${tummyTuckFigure('major-complications')}, major complications followed ${tummyTuckFigure('major-complications', 1)} of tummy tucks done alone and ${tummyTuckFigure('major-complications', 2)} of those combined with liposuction. Of those complications, ${tummyTuckFigure('complication-types')} were hematomas (bleeding under the skin), ${tummyTuckFigure('complication-types', 1)} infections and ${tummyTuckFigure('complication-types', 2)} suspected or confirmed blood clots (Winocour and colleagues, Plastic and Reconstructive Surgery, 2015).`,
        sourceId: 'winocour-2015',
    },
    {
        title: 'What raises the risk',
        body: `The same study found higher risk at ${tummyTuckFigure('risk-factors')} or older, with a BMI of 30 or more, and when several procedures were combined.`,
        sourceId: 'winocour-2015',
    },
    {
        title: 'Blood clots',
        body: 'A 2020 review found that blood clots occur more often after a tummy tuck than after any other cosmetic surgery, and more often still when liposuction is added. It advises assessing every patient’s clot risk before surgery (Mittal and colleagues, Aesthetic Plastic Surgery, 2020).',
        sourceId: 'mittal-2020',
    },
    {
        title: 'Fluid under the skin',
        body: `A 2019 review of studies covering ${tummyTuckFigure('seroma-rate')} found a seroma, fluid collecting under the skin, in ${tummyTuckFigure('seroma-rate', 1)} (Xia and colleagues, Aesthetic Plastic Surgery, 2019).`,
        sourceId: 'xia-2019',
    },
]

const checklist = [
    'Which tummy tuck do I need, and will you repair my muscles?',
    'Where will my scar sit, and how long will it be?',
    'What do you do to prevent blood clots, before and after surgery?',
    'Will I have drains, and for how long?',
    'Where will my surgery take place, and who gives the anesthesia?',
    'If it is in an office, which hospital will you name in writing?',
    "Which board certifies you? Then check that certification on the board's own website, not the clinic's.",
]

/** One layer of the drawing, as its legend names it. */
const LEGEND = [
    { label: 'Skin', swatch: 'h-0.5 bg-stone-300' },
    { label: 'Fat', swatch: 'h-2.5 bg-stone-700' },
    { label: 'Abdominal muscles', swatch: 'h-2.5 bg-stone-400' },
    { label: 'Stitches', swatch: 'h-0.5 bg-gold-400' },
] as const

function WallSection({ repaired }: { repaired: boolean }) {
    return (
        <svg
            viewBox='0 0 320 110'
            aria-hidden='true'
            focusable='false'
            className='block h-auto w-full'
        >
            {repaired ? (
                <>
                    {/* Fat under the skin, the abdomen flatter. */}
                    <path
                        d='M0 26 Q160 16 320 26 L320 48 Q160 40 0 48 Z'
                        className='fill-stone-700'
                    />
                    <path
                        d='M0 26 Q160 16 320 26'
                        fill='none'
                        className='stroke-stone-300'
                        strokeWidth='2'
                    />
                    {/* The two muscles, brought together at the midline. */}
                    <path
                        d='M16 52 Q90 43 158 43 L158 68 Q90 68 16 77 Q8 64 16 52 Z'
                        className='fill-stone-400'
                    />
                    <path
                        d='M304 52 Q230 43 162 43 L162 68 Q230 68 304 77 Q312 64 304 52 Z'
                        className='fill-stone-400'
                    />
                    <path
                        d='M155 45 L165 50 L155 55 L165 60 L155 65'
                        fill='none'
                        className='stroke-gold-400'
                        strokeWidth='2.25'
                        strokeLinejoin='round'
                    />
                    <path
                        d='M0 90 Q160 82 320 90'
                        fill='none'
                        className='stroke-stone-600'
                        strokeWidth='1.5'
                    />
                </>
            ) : (
                <>
                    {/* Fat under the skin, the abdomen bulging forward. */}
                    <path
                        d='M0 30 Q160 -2 320 30 L320 56 Q160 30 0 56 Z'
                        className='fill-stone-700'
                    />
                    <path
                        d='M0 30 Q160 -2 320 30'
                        fill='none'
                        className='stroke-stone-300'
                        strokeWidth='2'
                    />
                    {/* The two muscles, drifted apart. */}
                    <path
                        d='M16 58 Q70 45 122 42 Q130 55 122 68 Q70 70 16 83 Q8 70 16 58 Z'
                        className='fill-stone-400'
                    />
                    <path
                        d='M304 58 Q250 45 198 42 Q190 55 198 68 Q250 70 304 83 Q312 70 304 58 Z'
                        className='fill-stone-400'
                    />
                    {/* The thinned tissue between them, and the gap. */}
                    <path
                        d='M122 55 Q160 48 198 55'
                        fill='none'
                        className='stroke-stone-500'
                        strokeWidth='1.5'
                        strokeDasharray='3 3'
                    />
                    <ellipse
                        cx='160'
                        cy='55'
                        rx='44'
                        ry='20'
                        fill='none'
                        className='stroke-gold-400'
                        strokeWidth='1.5'
                        strokeDasharray='4 4'
                    />
                    <path
                        d='M0 96 Q160 76 320 96'
                        fill='none'
                        className='stroke-stone-600'
                        strokeWidth='1.5'
                    />
                </>
            )}
        </svg>
    )
}

/**
 * What a full tummy tuck repairs, drawn as a cross-section of the abdominal
 * wall: before, the two long muscles have drifted apart and the abdomen
 * bulges; after, they are stitched together at the midline. The captions
 * and legend are real text, so they are read, translated and quoted like
 * the rest of the page; the drawings are decoration. Not to scale.
 */
function TummyTuckRepairDiagram() {
    return (
        <figure aria-label='What a full tummy tuck repairs, drawn as a cross-section of the abdominal wall'>
            <p className='text-sm font-semibold tracking-[0.08em] text-stone-300 uppercase'>
                What a full tummy tuck repairs
            </p>
            <div className='mt-4 grid gap-5 border border-stone-700 bg-[#191614] p-4 md:p-5'>
                <div>
                    <WallSection repaired={false} />
                    <p className='mt-2 text-[0.9375rem] leading-[1.5] text-stone-300'>
                        <span className='font-bold text-stone-50'>Before.</span>{' '}
                        The muscles have separated, leaving a gap at the
                        midline, and the abdomen bulges forward.
                    </p>
                </div>
                <div className='border-t border-stone-700 pt-5'>
                    <WallSection repaired />
                    <p className='mt-2 text-[0.9375rem] leading-[1.5] text-stone-300'>
                        <span className='font-bold text-stone-50'>After.</span>{' '}
                        The muscles are stitched together at the midline and the
                        loose skin and fat are removed, so the abdomen sits
                        flatter.
                    </p>
                </div>
                <ul className='flex flex-wrap gap-x-5 gap-y-2 border-t border-stone-700 pt-4'>
                    {LEGEND.map((layer) => (
                        <li
                            key={layer.label}
                            className='flex items-center gap-2 text-sm text-stone-400'
                        >
                            <span
                                aria-hidden='true'
                                className={`block w-5 ${layer.swatch}`}
                            />
                            {layer.label}
                        </li>
                    ))}
                </ul>
            </div>
            <figcaption className='mt-3.5 text-sm leading-[1.45] text-stone-400'>
                A cross-section of the abdominal wall, not to scale. The mini
                and extended mini tummy tucks on our price list don&apos;t
                include the muscle repair.
            </figcaption>
        </figure>
    )
}

/**
 * "Is a tummy tuck safe?" The page's one dark band and its signature scene:
 * what the surgery repairs, how often it goes wrong and what Florida law
 * sets for office surgery, laid out by the kit's `ModuleSceneSection`. The
 * drawing sits between the answer and the law on phones, and stays pinned
 * beside the reading column from `lg`.
 *
 * The law is stated as the law, and the research as the research. Where
 * Alluring operates, and its plan to prevent blood clots, wait on the owner,
 * so the copy never claims the practice's own; the checklist asks readers to
 * put those questions to every surgeon, ours included.
 */
export function TummyTuckSafety() {
    return (
        <ModuleSceneSection
            question='Is a tummy tuck safe?'
            answer={
                <>
                    Serious problems are uncommon. In an insurance database of{' '}
                    {tummyTuckFigure('major-complications')}, major
                    complications followed{' '}
                    {tummyTuckFigure('major-complications', 1)} of tummy tucks
                    done alone and {tummyTuckFigure('major-complications', 2)}{' '}
                    of those combined with liposuction. Blood clots happen more
                    often after a tummy tuck than after other cosmetic surgery,
                    so the plan to prevent them matters, and Florida limits
                    liposuction with a tummy tuck in an office.
                </>
            }
            diagram={<TummyTuckRepairDiagram />}
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
                    label: 'Tummy tuck drains: what they are and how long they stay',
                    href: '/blog/tummy-tuck-drains-what-they-are-how-long-they-stay',
                },
            }}
            checklist={{
                heading:
                    'Questions to ask any tummy tuck surgeon, including us',
                questions: checklist,
            }}
        />
    )
}

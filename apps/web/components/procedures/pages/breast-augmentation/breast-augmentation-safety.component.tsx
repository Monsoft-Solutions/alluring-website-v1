import {
    ModuleSceneSection,
    type ModuleSceneEvidence,
    type ModuleSceneItem,
} from '@/components/procedures/module-kit/module-scene.component'
import { breastAugmentationFigure as figure } from '@/lib/data/procedures/facts/breast-augmentation.facts'

const law: ModuleSceneItem[] = [
    {
        title: "A boxed warning on every implant's labeling",
        body: 'It says implants are not lifetime devices and complications can mean more surgery; that BIA-ALCL, a cancer of the immune system, is more common with textured implants than smooth ones, and some patients have died from it; and that some patients report symptoms, such as fatigue or joint pain, whose individual risk is not well established.',
    },
    {
        title: 'A checklist you initial and sign',
        body: 'Before surgery, your surgeon must review the patient decision checklist with you. You initial each section and sign it, and the surgeon who places your implants signs it too.',
    },
    {
        title: 'Sold only to providers who use it',
        body: 'The FDA restricts the sale of breast implants to providers and facilities that give patients this information through the checklist.',
    },
    {
        title: 'Your implant, on a card',
        body: "After surgery you get a device card with your implant's style, size and serial or lot number. Before surgery, you have the right to ask for the implant's patient labeling.",
    },
    {
        title: `Saline at ${figure('fda-ages')} or older, silicone at ${figure('fda-ages', 1)} or older`,
        body: 'The ages at which the FDA approves each implant for breast augmentation.',
    },
]

const evidence: ModuleSceneEvidence[] = [
    {
        title: 'Why implants come out',
        body: `In Sientra's core study, ${figure('sientra-reoperation')} of women who had a first breast augmentation had another operation within ${figure('sientra-reoperation', 1)}, and the most common reason implants were removed was a wish for a different size or style: ${figure('size-change-reason')} of the implants removed.`,
        sourceId: 'sientra-brochure',
    },
    {
        title: 'Firm scar tissue around the implant',
        body: `In Mentor's study of its MemoryGel implants, ${figure('mentor-ten-year')} of women who had a first breast augmentation developed severe capsular contracture (Baker grade III or IV) within ${figure('mentor-ten-year', 2)}, and ${figure('mentor-ten-year', 1)} had another operation (Caplin and colleagues, Plastic and Reconstructive Surgery, 2021).`,
        sourceId: 'caplin-2021',
    },
    {
        title: 'BIA-ALCL, mostly with textured implants',
        body: `Of the BIA-ALCL cases reported to the FDA worldwide through June 2024, ${figure('bia-alcl-textured')} involved textured implants and ${figure('bia-alcl-textured', 1)} smooth ones; for the rest, the surface wasn't reported.`,
        sourceId: 'fda-bia-alcl-reports',
    },
    {
        title: 'Symptoms some patients call breast implant illness',
        body: 'The FDA says fatigue, memory loss, rash, brain fog and joint pain may be associated with breast implants, that these symptoms and their causes are poorly understood, and that in some cases removing the implants without replacing them is reported to reverse them.',
        sourceId: 'fda-risks',
    },
]

const checklist = [
    'Which implant will you use: its maker, saline or silicone, smooth or textured?',
    'When will I get the FDA checklist and the implant’s labeling to read?',
    'Over or under the muscle for my body, and why?',
    'How do we choose my size, and can I try sizes on?',
    'What happens if I want a different size later?',
    'What is your reoperation rate?',
    'Where will my surgery take place, and who gives the anesthesia?',
    "Which board certifies you? Then check that certification on the board's own website, not the clinic's.",
]

/** The ruler runs from surgery to 12 years, drawn to scale. */
const YEARS = 12
const X0 = 18
const X1 = 302
const yearX = (year: number) => X0 + ((X1 - X0) * year) / YEARS

/**
 * The next ten years with implants, drawn to scale in years: the checklist
 * before surgery, the FDA's screening schedule for silicone implants (the
 * first scan at 5–6 years, then every 2–3), the FDA's example removal
 * figure within 8–10 years and the makers' reoperation rates at 10 years.
 * Numbered marks on the ruler match the numbered list under it, which
 * carries every word as real text; the drawing itself is decoration
 * (`aria-hidden`), and its axis draws in as it scrolls into view
 * (`pm-draw-x`).
 *
 * The repeat scans are drawn at 8.5 and 11 years, the middle of each 2–3
 * year interval after a scan at 6; the text says "every 2–3 years".
 */
function BreastAugmentationTenYears() {
    const marks = [
        {
            when: 'Before surgery',
            body: "You read, initial and sign the FDA's patient decision checklist with your surgeon. After surgery you get a device card for your implants.",
        },
        {
            when: `Years ${figure('silicone-screening').replace(' years', '')}`,
            body: 'Silicone implants: your first ultrasound or MRI scan, even with no symptoms, because most ruptures are silent.',
        },
        {
            when: `Then every ${figure('silicone-screening', 1)}`,
            body: 'Repeat scans for as long as you have silicone implants. Saline implants need none: a rupture shows.',
        },
        {
            when: `Within ${figure('removed-within-8-10-years', 1)}`,
            body: `As many as ${figure('removed-within-8-10-years')} of women who get implants for augmentation have them removed, in the FDA's example checklist.`,
        },
        {
            when: `At ${figure('sientra-reoperation', 1)}`,
            body: `In the makers' studies of a first augmentation, ${figure('sientra-reoperation')} (Sientra) and ${figure('mentor-ten-year', 1)} (Mentor) of women had had another operation.`,
        },
        {
            when: 'After that',
            body: 'How long implants last varies by person and cannot be predicted, the FDA says.',
        },
    ]

    return (
        <figure aria-label='The years ahead with breast implants, drawn to scale'>
            <p className='text-sm font-semibold tracking-[0.08em] text-stone-300 uppercase'>
                The years ahead with implants
            </p>
            <div className='mt-4 border border-stone-700 bg-[#191614] px-4 pt-4 pb-5 md:px-5'>
                <svg
                    viewBox='0 0 320 104'
                    aria-hidden='true'
                    focusable='false'
                    className='block h-auto w-full'
                >
                    {/* The axis, with a tick every year and a label every two. */}
                    <line
                        x1={X0}
                        y1='56'
                        x2={X1}
                        y2='56'
                        className='pm-draw-x stroke-stone-500'
                        strokeWidth='2'
                        style={{ transformBox: 'fill-box' }}
                    />
                    {Array.from({ length: YEARS + 1 }, (_, year) => (
                        <g key={year}>
                            <line
                                x1={yearX(year)}
                                y1='52'
                                x2={yearX(year)}
                                y2='60'
                                className='stroke-stone-600'
                                strokeWidth='1'
                            />
                            {year % 2 === 0 && (
                                <text
                                    x={yearX(year)}
                                    y='100'
                                    textAnchor='middle'
                                    className='fill-stone-400 text-[10px]'
                                >
                                    {year}
                                </text>
                            )}
                        </g>
                    ))}

                    {/* 1 · the checklist, before surgery. */}
                    <circle
                        cx={yearX(0)}
                        cy='56'
                        r='5'
                        className='fill-gold-400'
                    />
                    <Marker x={yearX(0)} y={30} n={1} />

                    {/* 2 · the first scan, years 5–6. */}
                    <rect
                        x={yearX(5)}
                        y='46'
                        width={yearX(6) - yearX(5)}
                        height='20'
                        rx='2'
                        className='fill-gold-400'
                    />
                    <Marker x={(yearX(5) + yearX(6)) / 2} y={30} n={2} />

                    {/* 3 · repeat scans every 2–3 years. */}
                    {[8.5, 11].map((year) => (
                        <rect
                            key={year}
                            x={yearX(year) - 4}
                            y='50'
                            width='8'
                            height='12'
                            rx='2'
                            className='fill-gold-300/70'
                        />
                    ))}
                    <Marker x={yearX(9.75)} y={30} n={3} />

                    {/* 4 · removals within 8–10 years, a bracket under the axis. */}
                    <path
                        d={`M${yearX(8)} 68 v6 H${yearX(10)} v-6`}
                        fill='none'
                        className='stroke-stone-300'
                        strokeWidth='1.5'
                    />
                    <Marker x={yearX(9)} y={86} n={4} />

                    {/* 5 · another operation by 10 years. */}
                    <line
                        x1={yearX(10)}
                        y1='16'
                        x2={yearX(10)}
                        y2='56'
                        className='stroke-gold-300'
                        strokeWidth='1.5'
                        strokeDasharray='3 3'
                    />
                    <Marker x={yearX(10) + 13} y={16} n={5} />

                    {/* 6 · after that, unpredictable. */}
                    <path
                        d={`M${X1 - 2} 50 L${X1 + 8} 56 L${X1 - 2} 62`}
                        fill='none'
                        className='stroke-stone-500'
                        strokeWidth='2'
                    />
                </svg>
                <p className='mt-1 text-xs text-stone-400'>
                    Years after surgery
                </p>

                <ol className='mt-4 flex flex-col gap-3.5 border-t border-stone-700 pt-4'>
                    {marks.map((mark, index) => (
                        <li
                            key={mark.when}
                            className='grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-3'
                        >
                            <span
                                aria-hidden='true'
                                className='border-gold-400 text-gold-200 flex size-6 items-center justify-center rounded-full border text-xs font-bold tabular-nums'
                            >
                                {index + 1}
                            </span>
                            <div>
                                <p className='text-[0.9375rem] leading-[1.45] font-bold text-stone-50 tabular-nums'>
                                    {mark.when}
                                </p>
                                <p className='mt-0.5 text-[0.9375rem] leading-[1.5] text-stone-300'>
                                    {mark.body}
                                </p>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
            <figcaption className='mt-3.5 text-sm leading-[1.45] text-stone-400'>
                Drawn to scale in years. The scans are the FDA&apos;s schedule
                for silicone implants; the rates come from the FDA&apos;s
                example checklist and the makers&apos; own studies, not from
                Alluring.
            </figcaption>
        </figure>
    )
}

/** A numbered mark on the ruler, matching the list under it. */
function Marker({ x, y, n }: { x: number; y: number; n: number }) {
    return (
        <g>
            <circle
                cx={x}
                cy={y}
                r='8'
                className='stroke-gold-400 fill-[#191614]'
                strokeWidth='1.25'
            />
            <text
                x={x}
                y={y + 3.25}
                textAnchor='middle'
                className='fill-gold-200 text-[10px] font-bold'
            >
                {n}
            </text>
        </g>
    )
}

/**
 * "Are breast implants safe?" The page's one dark band and its signature
 * scene: the next ten years with implants, drawn to scale, beside what the
 * FDA requires before surgery and what the makers' 10-year studies found,
 * laid out by the kit's `ModuleSceneSection`. The drawing sits between the
 * answer and the FDA's rules on phones, and stays pinned beside the
 * reading column from `lg`.
 *
 * The FDA's rules are stated as the FDA's, and the studies as each maker's.
 * Which implants Dr. Karlinsky uses, her reoperation rate and where she
 * operates wait on the owner, so the copy never claims the practice's own;
 * the checklist asks readers to put those questions to every surgeon, ours
 * included.
 */
export function BreastAugmentationSafety() {
    return (
        <ModuleSceneSection
            question='Are breast implants safe?'
            answer={`The FDA approves them, and they aren't lifetime devices. Before surgery you read, initial and sign the FDA's patient checklist with your surgeon. For silicone implants, the FDA recommends a screening scan at ${figure('silicone-screening')} and every ${figure('silicone-screening', 1)} after, because a rupture can be silent. How long yours last can't be predicted.`}
            diagram={<BreastAugmentationTenYears />}
            tabularFigures
            law={{
                heading: 'What the FDA requires',
                sources: [
                    {
                        label: 'FDA, Things to Consider Before Getting Breast Implants',
                        sourceId: 'fda-things-to-consider',
                    },
                    {
                        label: 'FDA, What to Know About Breast Implants',
                        sourceId: 'fda-what-to-know',
                    },
                ],
                items: law,
            }}
            evidence={{
                heading: 'What the long-term studies show',
                items: evidence,
                link: {
                    label: 'Breast implant illness: symptoms and what to ask',
                    href: '/blog/breast-implant-illness-symptoms',
                },
            }}
            checklist={{
                heading:
                    'Questions to ask any breast augmentation surgeon, including us',
                questions: checklist,
            }}
        />
    )
}

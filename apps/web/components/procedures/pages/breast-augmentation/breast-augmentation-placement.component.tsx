import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'

import { ModuleComparison } from '@/components/procedures/module-kit/module-comparison.component'
import {
    moduleBody,
    moduleH3,
    moduleLink,
    moduleSectionPad,
} from '@/components/procedures/module-kit/module-ui.constant'
import { AnswerBlock } from '@/components/procedures/sections/answer-block.component'
import { breastAugmentationFigure as figure } from '@/lib/data/procedures/facts/breast-augmentation.facts'

export type ImplantPlacement = 'under' | 'over'

/**
 * The layers of the chest in profile, drawn abstractly: the ribs, the chest
 * muscle, the breast tissue and the skin, with the implant under or over
 * the muscle. The three incision sites ASPS lists are numbered on the
 * outline: the fold under the breast (1), the edge of the areola (2) and
 * the armpit (3). Shapes only, no body; the legend and the list beside it
 * say everything the drawing shows, so it is `aria-hidden`. Not to scale.
 */
function ChestSection({ placement }: { placement: ImplantPlacement }) {
    const under = placement === 'under'

    return (
        <svg
            viewBox='0 0 200 180'
            aria-hidden='true'
            focusable='false'
            className='block h-auto w-full'
        >
            {/* Ribs: the chest wall. */}
            {[34, 66, 98, 130, 162].map((y) => (
                <ellipse
                    key={y}
                    cx='16'
                    cy={y}
                    rx='8'
                    ry='11'
                    className='fill-stone-300'
                />
            ))}

            {/* Breast tissue and the skin over it. */}
            <path
                d='M30 18 C78 22 146 58 156 104 C162 136 132 162 92 166 C66 168 46 166 30 164 Z'
                className='fill-stone-100 stroke-stone-500'
                strokeWidth='1.75'
            />

            {under ? (
                <>
                    {/* The implant against the chest wall, the muscle over it. */}
                    <ellipse
                        cx='50'
                        cy='104'
                        rx='18'
                        ry='40'
                        className='fill-gold-200 stroke-gold-500'
                        strokeWidth='1.5'
                    />
                    <path
                        d='M28 16 C52 30 82 62 78 104 C76 130 62 150 40 162 L32 156 C52 144 66 126 68 104 C70 68 46 40 26 28 Z'
                        className='fill-stone-400'
                    />
                </>
            ) : (
                <>
                    {/* The muscle on the chest wall, the implant in front of it. */}
                    <path
                        d='M28 18 C40 40 42 120 34 164 L26 164 C32 120 32 40 22 22 Z'
                        className='fill-stone-400'
                    />
                    <ellipse
                        cx='66'
                        cy='104'
                        rx='22'
                        ry='40'
                        className='fill-gold-200 stroke-gold-500'
                        strokeWidth='1.5'
                    />
                </>
            )}

            {/* The incision sites: 1 the fold, 2 the edge of the areola, 3 the armpit. */}
            <Incision x={70} y={166} n={1} labelX={86} />
            <Incision x={157} y={110} n={2} labelX={176} />
            <path
                d='M38 16 L38 4'
                className='stroke-gold-500'
                strokeWidth='1.5'
                strokeDasharray='2 2'
            />
            <Incision x={38} y={8} n={3} labelX={56} />
        </svg>
    )
}

function Incision({
    x,
    y,
    n,
    labelX,
    labelY,
}: {
    x: number
    y: number
    n: number
    labelX?: number
    labelY?: number
}) {
    return (
        <g>
            <circle cx={x} cy={y} r='5' className='fill-gold-500' />
            <text
                x={labelX ?? x}
                y={(labelY ?? y) + 4.5}
                textAnchor='middle'
                className='fill-stone-800 text-[13px] font-bold'
            >
                {n}
            </text>
        </g>
    )
}

/** The posts that own the comparison and the two questions under it. */
const placementGuides = [
    {
        label: 'Over or under the muscle? Placement compared',
        href: '/blog/breast-implants-over-or-under-the-muscle',
    },
    {
        label: 'Mammograms, pregnancy and breastfeeding with implants',
        href: '/blog/mammograms-breastfeeding-with-breast-implants',
    },
]

const LEGEND = [
    { label: 'Ribs', swatch: 'bg-stone-300' },
    { label: 'Chest muscle', swatch: 'bg-stone-400' },
    { label: 'Breast tissue', swatch: 'bg-stone-100 ring-1 ring-stone-500' },
    { label: 'Implant', swatch: 'bg-gold-200 ring-1 ring-gold-500' },
] as const

/**
 * Under or over the muscle, side by side, with the incision sites. The
 * captions are real text; the drawings are decoration.
 */
function BreastAugmentationPlacementDiagram() {
    return (
        <figure
            aria-label='Where a breast implant sits, under or over the chest muscle, and the three incision sites'
            className='mt-9 max-w-[41.25rem]'
        >
            <div className='grid grid-cols-2 gap-4 border border-stone-200 bg-stone-50 p-4 md:gap-6 md:p-5'>
                <div>
                    <ChestSection placement='under' />
                    <p className='mt-2 text-[0.9375rem] leading-[1.45] text-stone-700'>
                        <span className='font-bold text-stone-900'>
                            Under the muscle.
                        </span>{' '}
                        The implant sits against the chest wall, with the muscle
                        over it.
                    </p>
                </div>
                <div>
                    <ChestSection placement='over' />
                    <p className='mt-2 text-[0.9375rem] leading-[1.45] text-stone-700'>
                        <span className='font-bold text-stone-900'>
                            Over the muscle.
                        </span>{' '}
                        The implant sits directly behind the breast tissue.
                    </p>
                </div>
                <ul className='col-span-2 flex flex-wrap gap-x-5 gap-y-2 border-t border-stone-200 pt-3.5'>
                    {LEGEND.map((layer) => (
                        <li
                            key={layer.label}
                            className='flex items-center gap-2 text-sm text-stone-600'
                        >
                            <span
                                aria-hidden='true'
                                className={`block size-3 rounded-sm ${layer.swatch}`}
                            />
                            {layer.label}
                        </li>
                    ))}
                </ul>
            </div>
            <figcaption className='mt-3 text-sm leading-[1.45] text-stone-500'>
                A profile of the chest, not to scale. The numbered marks are the
                incision sites listed below.
            </figcaption>
        </figure>
    )
}

/**
 * "Over or under the muscle, and where is the incision?" The two choices
 * after the implant itself, answered with what the sources say about each:
 * the placement as a drawing and a comparison, then the incision sites,
 * numbered as on the drawing.
 *
 * Dr. Karlinsky's usual placement and incision wait on the owner, so the
 * copy says the surgeon recommends both at the exam and never claims hers.
 */
export function BreastAugmentationPlacement() {
    return (
        <AnswerBlock
            id='placement'
            question='Over or under the muscle, and where is the incision?'
            className={moduleSectionPad}
            answer='The implant goes under the chest muscle or over it, directly behind the breast tissue, and the incision goes in the fold under the breast, along the edge of the areola or in the armpit, ASPS says. Which fits depends on your implant, your body and the size you want; your surgeon recommends both.'
        >
            <BreastAugmentationPlacementDiagram />

            <ModuleComparison
                caption='Under or over the muscle'
                columns={[
                    { key: 'under', label: 'Under the muscle' },
                    { key: 'over', label: 'Over the muscle' },
                ]}
                rows={[
                    {
                        label: 'Mammograms',
                        cells: [
                            'May interfere less, and the extra mammogram views are easier',
                            'May interfere',
                        ],
                    },
                    {
                        label: 'Breastfeeding',
                        cells: [
                            'May interfere less; usually affects milk production less',
                            'May interfere',
                        ],
                    },
                    {
                        label: `Capsular contracture within ${figure('natrelle-placement-contracture', 2)}, in one study`,
                        cells: [
                            figure('natrelle-placement-contracture'),
                            figure('natrelle-placement-contracture', 1),
                        ],
                    },
                    {
                        label: 'When you flex your chest',
                        cells: [
                            'The implant may move',
                            'The implant should stay in place',
                        ],
                    },
                ]}
                note={
                    <>
                        Mammograms and breastfeeding from The Aesthetic Society,
                        the American Cancer Society and Cleveland Clinic.
                        Capsular contracture, firm scar tissue around the
                        implant, from Allergan&apos;s study of its Natrelle
                        round silicone implants (Spear and Murphy, 2014). Moving
                        when you flex from The Aesthetic Society.
                    </>
                }
            />
            <ul className='mt-6 flex flex-col gap-1 border-t border-stone-200 pt-5'>
                {placementGuides.map((guide) => (
                    <li key={guide.href}>
                        <Link
                            href={guide.href}
                            className={cn(
                                moduleLink,
                                'inline-flex min-h-11 items-center text-base font-bold'
                            )}
                        >
                            {guide.label}
                        </Link>
                    </li>
                ))}
            </ul>

            <h3 className={cn(moduleH3, 'mt-10 md:mt-11')}>
                Where the incision goes
            </h3>
            <ol className='mt-4 flex max-w-[41.25rem] list-decimal flex-col gap-2 pl-6 text-[1.0625rem] leading-[1.55] text-stone-800 marker:font-bold marker:text-stone-900'>
                <li>The fold under the breast (inframammary)</li>
                <li>The edge of the areola (periareolar)</li>
                <li>The armpit (axillary)</li>
            </ol>
            <p className={cn(moduleBody, 'mt-4')}>
                ASPS says a belly-button (transumbilical) approach is associated
                with a higher complication rate, and the FDA lists an incision
                site it has not approved, such as the belly button, among the
                causes of rupture. The scar fades over several months, even a
                couple of years, ASPS says.{' '}
                <Link
                    href='/blog/breast-augmentation-scars-miami-timeline'
                    className={moduleLink}
                >
                    Breast augmentation scars: where they are, how they fade
                </Link>
            </p>
        </AnswerBlock>
    )
}

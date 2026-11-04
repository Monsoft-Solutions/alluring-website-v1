import {
    getMommyMakeoverFact,
    mommyMakeoverFigure,
} from '@/lib/data/procedures/facts/mommy-makeover.facts'

/** The parts of a plan, numbered as the outline numbers them. */
const parts = [
    {
        name: 'Breasts',
        detail: 'Augmentation, lift, lift with implants or reduction',
        price: `From ${mommyMakeoverFigure('price-augmentation-saline')}`,
    },
    {
        name: 'Abdomen',
        detail: 'Mini, extended mini, full or extended tummy tuck',
        price: `From ${mommyMakeoverFigure('price-mini-tummy-tuck')}`,
    },
    {
        name: 'Body',
        detail: `Lipo 360, or an area added to another procedure from ${mommyMakeoverFigure('price-lipo-add-on')}`,
        price: `From ${mommyMakeoverFigure('price-lipo-360')}`,
    },
]

/** Where each number sits on the outline, in the drawing's coordinates. */
const MARKERS = [
    { n: 1, x: 80, y: 86 },
    { n: 2, x: 80, y: 142 },
    { n: 3, x: 118, y: 172 },
]

/**
 * The rows of Winocour 2015 that match a plan this page prices. The study's two
 * rows with "another body-contouring procedure" aren't parts of any such plan,
 * so they are a sentence under the table rather than bars.
 */
const rows = [
    { label: 'Tummy tuck alone', figure: 1, closest: false },
    { label: 'Tummy tuck + liposuction', figure: 2, closest: false },
    { label: 'Tummy tuck + a breast procedure', figure: 3, closest: false },
    {
        label: 'Tummy tuck + liposuction + a breast procedure',
        figure: 4,
        closest: true,
    },
]

/** The bars run 0–5%, so their lengths compare honestly. */
const BAR_SCALE_TOP = 5

const figures = getMommyMakeoverFact('major-complications').figures

/** A bar's length as a share of its lane, from the facts file. */
function barWidth(index: number): string {
    const figure = figures[index]
    const value = figure && 'value' in figure ? figure.value : 0
    return `${(value / BAR_SCALE_TOP) * 100}%`
}

/**
 * A dressmaker's form: an outline with no body on it, so the drawing shows
 * where the parts of a plan sit and nothing else. Not to scale.
 */
function PlanOutline() {
    return (
        <svg
            viewBox='0 0 160 240'
            aria-hidden='true'
            focusable='false'
            className='block h-full w-full'
        >
            <path
                d='M64 18 V36 C50 44 36 48 30 58 C38 80 40 92 38 112 C37 130 50 146 48 164 C46 186 34 200 34 224 H126 C126 200 114 186 112 164 C110 146 123 130 122 112 C120 92 122 80 130 58 C124 48 110 44 96 36 V18'
                fill='none'
                className='stroke-stone-400'
                strokeWidth='1.5'
                strokeLinejoin='round'
                strokeLinecap='round'
            />
            <path
                d='M80 18 V224'
                fill='none'
                className='stroke-stone-600'
                strokeWidth='1'
                strokeDasharray='2 5'
            />
            {MARKERS.map((marker) => (
                <g key={marker.n}>
                    <circle
                        cx={marker.x}
                        cy={marker.y}
                        r='11'
                        className='fill-gold-400'
                    />
                    <text
                        x={marker.x}
                        y={marker.y + 4.5}
                        textAnchor='middle'
                        className='fill-stone-900 font-serif text-[13px]'
                    >
                        {marker.n}
                    </text>
                </g>
            ))}
        </svg>
    )
}

/**
 * The signature scene, "One plan, part by part". A mommy makeover isn't one
 * procedure, it is a plan of parts, and the honest question is what each part
 * costs and what each part adds to the risk. So: the parts as a ledger, with
 * their prices and the combination rule, ending on a total with no figure on
 * purpose; then what major complications did as parts were added to a tummy
 * tuck, from the one study that breaks it down line by line.
 *
 * No state and no arithmetic: every word is text and the ladder is a real table
 * with row headers. Only the outline and the bars are decoration. Bar lengths
 * come from the facts file, to scale. On a phone they draw in with `pm-draw-x`.
 * From `lg` the kit pins the diagram, which stretches a scroll timeline over the
 * whole band, so a bar could rest half drawn for as long as she reads; a bar is
 * data, so there it stays at its full length.
 */
export function MommyMakeoverPlanDiagram() {
    return (
        <figure aria-label='A mommy makeover plan, part by part, and how the risk of major complications changes as parts are added'>
            <p className='text-sm font-semibold tracking-[0.08em] text-stone-300 uppercase'>
                One plan, part by part
            </p>

            <div className='mt-4 border border-stone-700 bg-stone-950 p-4 md:p-5'>
                <div className='grid grid-cols-[5.5rem_minmax(0,1fr)] gap-4 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:gap-5'>
                    <div
                        aria-hidden='true'
                        className='h-36 self-start overflow-hidden rounded-t-full border border-stone-700 bg-stone-900 pt-3 sm:h-40'
                    >
                        <PlanOutline />
                    </div>
                    <ol className='flex flex-col gap-3'>
                        {parts.map((part, index) => (
                            <li
                                key={part.name}
                                className='grid grid-cols-[1.375rem_minmax(0,1fr)] gap-x-2 text-[0.9375rem] leading-[1.45]'
                            >
                                <span
                                    aria-hidden='true'
                                    className='bg-gold-400 mt-px flex size-[1.125rem] items-center justify-center rounded-full font-serif text-xs text-stone-900'
                                >
                                    {index + 1}
                                </span>
                                <p className='flex justify-between gap-3'>
                                    <span className='font-bold text-stone-50'>
                                        {part.name}
                                    </span>{' '}
                                    <span className='text-gold-300 font-bold whitespace-nowrap tabular-nums'>
                                        {part.price}
                                    </span>
                                </p>
                                <p className='col-start-2 text-stone-300'>
                                    {part.detail}
                                </p>
                            </li>
                        ))}
                    </ol>
                </div>

                <dl className='mt-4 flex flex-col gap-1.5 border-t border-stone-700 pt-3.5 text-[0.9375rem] leading-[1.45] tabular-nums'>
                    <div className='flex justify-between gap-4'>
                        <dt className='text-stone-300'>
                            Two procedures combined
                        </dt>
                        <dd className='font-bold whitespace-nowrap text-stone-50'>
                            {mommyMakeoverFigure('price-combination-discount')}{' '}
                            off
                        </dd>
                    </div>
                    <div className='flex justify-between gap-4'>
                        <dt className='text-stone-300'>
                            Three procedures combined
                        </dt>
                        <dd className='font-bold whitespace-nowrap text-stone-50'>
                            {mommyMakeoverFigure(
                                'price-combination-discount',
                                1
                            )}{' '}
                            off
                        </dd>
                    </div>
                    <div className='flex justify-between gap-4 border-t border-stone-700 pt-1.5'>
                        <dt className='font-bold text-stone-50'>Your total</dt>
                        <dd className='text-right text-stone-300'>
                            Confirmed after your exam
                        </dd>
                    </div>
                </dl>
            </div>

            <table className='mt-5 w-full border-collapse text-left tabular-nums'>
                <caption className='pb-3 text-left text-[0.9375rem] leading-[1.45] text-stone-300'>
                    <span className='block text-sm font-semibold tracking-[0.08em] text-stone-300 uppercase'>
                        What each part adds
                    </span>{' '}
                    <span className='mt-1 block'>
                        Major complications after a tummy tuck, by what was done
                        with it
                    </span>
                </caption>
                <thead className='sr-only'>
                    <tr>
                        <th scope='col'>What was done</th>
                        <th scope='col'>Major complications</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr
                            key={row.label}
                            className='border-t border-stone-700'
                        >
                            <th
                                scope='row'
                                className='py-2.5 pr-4 align-top text-[0.9375rem] leading-[1.4] font-normal text-stone-200'
                            >
                                <span className='block'>{row.label}</span>
                                {row.closest && (
                                    <>
                                        {' '}
                                        <span className='text-gold-300 mt-0.5 block text-sm'>
                                            The line closest to a full plan
                                        </span>
                                    </>
                                )}
                                <span
                                    aria-hidden='true'
                                    className='mt-2 block h-2 w-full bg-stone-800'
                                >
                                    <span
                                        className={`pm-draw-x block h-full lg:animate-none! ${row.closest ? 'bg-gold-400' : 'bg-stone-400'}`}
                                        style={{
                                            width: barWidth(row.figure),
                                        }}
                                    />
                                </span>
                            </th>
                            <td className='py-2.5 text-right align-top text-[1.0625rem] leading-[1.3] font-bold text-stone-50'>
                                {mommyMakeoverFigure(
                                    'major-complications',
                                    row.figure
                                )}
                                <span className='sr-only'>
                                    {' '}
                                    major complications
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <figcaption className='mt-3.5 flex flex-col gap-2.5 text-sm leading-[1.5] text-stone-400'>
                <span className='block'>
                    Major complications in an insurance database of{' '}
                    {mommyMakeoverFigure('major-complications')}, 2008–2013
                    (Winocour and colleagues, 2015). Bars drawn to scale. These
                    are not Alluring&apos;s rates.
                </span>{' '}
                <span className='block'>
                    The same study found major complications after{' '}
                    {mommyMakeoverFigure('major-complications-body-contouring')}{' '}
                    of tummy tucks with another body-contouring procedure and{' '}
                    {mommyMakeoverFigure(
                        'major-complications-body-contouring',
                        1
                    )}{' '}
                    of those with liposuction and another body-contouring
                    procedure, which are not parts of the plans priced here.
                </span>
            </figcaption>
        </figure>
    )
}

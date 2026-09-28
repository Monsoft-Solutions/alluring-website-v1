import {
    ModuleSceneSection,
    type ModuleSceneEvidence,
    type ModuleSceneItem,
} from '@/components/procedures/module-kit/module-scene.component'
import { lipoFigure } from '@/lib/data/procedures/facts/lipo.facts'

const law: ModuleSceneItem[] = [
    {
        title: `At most ${lipoFigure('florida-office-limit-4000cc')} in a doctor's office`,
        body: "That is the most supernatant fat Florida's Board of Medicine allows liposuction to remove in a physician's office. The limit covers offices, not hospitals or licensed surgery centers.",
    },
    {
        title: `At most ${lipoFigure('florida-with-tummy-tuck-1000cc')} with a tummy tuck`,
        body: 'When liposuction is combined with a tummy tuck in the same office operation, that is as much as it may remove.',
    },
    {
        title: `Registration above ${lipoFigure('florida-registration-1000cc')}`,
        body: 'An office where liposuction removes more than that amount must register with the Florida Department of Health, and the surgeon keeps a log of those procedures.',
    },
    {
        title: 'What the numbers measure',
        body: 'Supernatant fat: the fat alone, once the fluid removed with it has separated out.',
    },
]

const evidence: ModuleSceneEvidence[] = [
    {
        title: 'How often serious problems happen',
        body: 'In an insurance database of cosmetic surgery, major complications, meaning an emergency visit, a hospital stay or another operation within 30 days, followed 0.7% of liposuction-only procedures. The authors concluded that combining liposuction with other procedures, especially in older patients or patients with obesity, can significantly increase complication rates (Kaoutzanis and colleagues, Aesthetic Surgery Journal, 2017).',
        sourceId: 'kaoutzanis-2017',
    },
    {
        title: 'The most common problem',
        body: 'A 2024 review of 39 studies and 29,368 patients found that an uneven contour was the most common complication of liposuction, in 2.35% of patients (Comerci and colleagues, Aesthetic Surgery Journal, 2024).',
        sourceId: 'comerci-2024',
    },
]

const checklist = [
    "How much fat do you plan to remove, and how does that compare with Florida's limit?",
    'Where will my surgery take place: an office, a surgery center or a hospital?',
    'If it is an office, is it registered with the Florida Department of Health?',
    'Who gives the anesthesia, and what kind will I have?',
    'Will anything else be done in the same surgery? How much liposuction then?',
    "Which board certifies you? Then check that certification on the board's own website, not the clinic's.",
]

/** Ticks on the scale, in cubic centimeters. The column runs 0–5,000. */
const TICKS = [1000, 2000, 3000, 4000]
const SCALE_TOP = 5000

/**
 * Florida's two liposuction lines as a measuring scale, drawn to its numbers:
 * the column runs from 0 to 5,000 cc, so the 4,000 cc office limit sits a
 * fifth of the way down and the 1,000 cc line a fifth of the way up. Real
 * text, not a picture of text, so it is read, translated and quoted like the
 * rest of the page. The fill rises as the scale scrolls into view
 * (`pm-draw-y`).
 *
 * It stays on Florida's own measure, supernatant fat. ASPS's large-volume
 * threshold counts total aspirate, a different measure, so it isn't drawn.
 */
function LipoVolumeScale() {
    return (
        <figure aria-label="Florida's liposuction limits in a doctor's office, drawn as a measuring scale">
            <div className='grid grid-cols-[4.25rem_minmax(0,1fr)] border border-stone-700'>
                <div
                    aria-hidden='true'
                    className='relative h-[22rem] border-r border-stone-700 bg-[#191614] lg:h-[26rem]'
                >
                    <div
                        className='pm-draw-y from-gold-400/45 to-gold-400/10 border-gold-400 absolute inset-x-2.5 bottom-0 border-t-2 bg-gradient-to-t'
                        style={{ height: `${(4000 / SCALE_TOP) * 100}%` }}
                    />
                    {TICKS.map((tick) => (
                        <div
                            key={tick}
                            className='absolute inset-x-0 border-t border-stone-600'
                            style={{ bottom: `${(tick / SCALE_TOP) * 100}%` }}
                        >
                            <span className='absolute -top-2.5 right-1.5 bg-[#191614] px-0.5 text-[0.6875rem] text-stone-400 tabular-nums'>
                                {tick.toLocaleString('en-US')}
                            </span>
                        </div>
                    ))}
                </div>
                <div className='relative h-[22rem] lg:h-[26rem]'>
                    <div
                        className='border-gold-400 absolute inset-x-0 border-t-2 px-4 pt-2.5'
                        style={{ top: `${(1 - 4000 / SCALE_TOP) * 100}%` }}
                    >
                        <p className='text-base font-bold text-stone-50 tabular-nums'>
                            {lipoFigure('florida-office-limit-4000cc')}
                        </p>
                        <p className='mt-0.5 text-[0.875rem] leading-[1.4] text-stone-300'>
                            The most fat that may be removed by liposuction in a
                            doctor&apos;s office
                        </p>
                    </div>
                    <div
                        className='absolute inset-x-0 border-b-2 border-dashed border-stone-400 px-4 pb-2.5'
                        style={{ bottom: `${(1000 / SCALE_TOP) * 100}%` }}
                    >
                        <p className='text-base font-bold text-stone-50 tabular-nums'>
                            {lipoFigure('florida-with-tummy-tuck-1000cc')}
                        </p>
                        <p className='mt-0.5 text-[0.875rem] leading-[1.4] text-stone-300'>
                            The most with a tummy tuck in the same office
                            operation. Above it, the office must register with
                            the state and keep a log.
                        </p>
                    </div>
                </div>
            </div>
            <figcaption className='mt-3.5 text-sm leading-[1.45] text-stone-400'>
                Supernatant fat, the fat alone, in cubic centimeters. Drawn to
                scale. Florida Administrative Code 64B8-9.009.
            </figcaption>
        </figure>
    )
}

/**
 * "Is liposuction safe?" The page's one dark band and its signature scene:
 * Florida's liposuction limits, which no Miami competitor cites, laid out by
 * the kit's `ModuleSceneSection`. The scale sits between the answer and the
 * law on phones, and stays pinned beside the reading column from `lg`.
 *
 * The law is stated as the law. Where Alluring operates, and how its
 * facility is certified, wait on the owner, so the copy never claims the
 * practice's own compliance; the checklist asks readers to put those
 * questions to every surgeon, ours included.
 */
export function LipoSafety() {
    return (
        <ModuleSceneSection
            question='Is liposuction safe?'
            answer={
                <>
                    Serious problems are uncommon when liposuction is done on
                    its own. A study of an insurance database of cosmetic
                    surgery found major complications after{' '}
                    {lipoFigure('major-complications-0-7-percent')} of
                    liposuction-only procedures, and combining liposuction with
                    other surgery can significantly increase that risk. The most
                    common problem is an uneven contour, and Florida limits how
                    much fat can come out in an office.
                </>
            }
            diagram={<LipoVolumeScale />}
            diagramWidth='narrow'
            tabularFigures
            law={{
                heading: 'What Florida law sets',
                sources: [
                    {
                        label: 'Florida Administrative Code 64B8-9.009',
                        sourceId: 'florida-rule-64b8-9-009',
                    },
                    {
                        label: 'Florida Statutes §458.328',
                        sourceId: 'florida-statutes-458-328',
                    },
                ],
                items: law,
            }}
            evidence={{
                items: evidence,
                link: {
                    label: 'What happens if liposuction leaves an uneven result',
                    href: '/how-to-fix-uneven-liposuction',
                },
            }}
            checklist={{
                heading:
                    'Questions to ask any liposuction surgeon, including us',
                questions: checklist,
            }}
        />
    )
}

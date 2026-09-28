import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '@workspace/ui/lib/utils'

import { moduleLink } from './module-ui.constant'

export type ModuleStep = { title: string; body: ReactNode }

/**
 * A surgery told as numbered steps. The steps are a sequence, so the numbers
 * carry information; the page writes them next to its own answer.
 */
export function ModuleSteps({ steps }: { steps: ModuleStep[] }) {
    return (
        <ol className='mt-9 flex flex-col gap-6'>
            {steps.map((step, index) => (
                <li
                    key={step.title}
                    className='grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 md:gap-x-5'
                >
                    <span
                        aria-hidden='true'
                        className='border-gold-500 flex size-10 items-center justify-center rounded-full border font-serif text-lg text-stone-900 tabular-nums'
                    >
                        {index + 1}
                    </span>
                    <div className='pt-1.5'>
                        <h3 className='text-[1.0625rem] leading-[1.45] font-bold text-stone-900 md:text-lg'>
                            {step.title}
                        </h3>
                        <p className='mt-1 max-w-[38rem] text-[1.0625rem] leading-[1.6] text-stone-700'>
                            {step.body}
                        </p>
                    </div>
                </li>
            ))}
        </ol>
    )
}

export type ModuleMilestone = {
    when: string
    body: ReactNode
    /**
     * With `tracks`: the keys of the tracks this stage belongs to. Unset, it
     * belongs to both. Ignored on a single-track timeline.
     */
    tracks?: string[]
}

/** One parallel track of a recovery, e.g. "Abdomen". */
export type ModuleTimelineTrack = { key: string; label: string }

/**
 * A recovery timeline. The rule and dots are drawn by `module-kit.css` from
 * the list items: the rule draws down and each dot fills as that stage
 * reaches the middle of the screen. Every figure in `body` must be a fact in
 * the page's facts file.
 *
 * With `tracks`, two recoveries run on one time axis, such as the abdomen
 * and the breasts after a mommy makeover (`ModuleTrackedTimeline`).
 */
export function ModuleTimeline({
    label,
    milestones,
    tracks,
    bothLabel,
}: {
    /** Names the list, e.g. "BBL recovery timeline". */
    label: string
    milestones: ModuleMilestone[]
    /** Exactly two parallel tracks; unset, the timeline has one. */
    tracks?: [ModuleTimelineTrack, ModuleTimelineTrack]
    /**
     * Names a stage that belongs to both tracks, on phones. Defaults to the
     * two names joined, e.g. "Abdomen and breasts".
     */
    bothLabel?: string
}) {
    if (tracks) {
        return (
            <ModuleTrackedTimeline
                label={label}
                milestones={milestones}
                tracks={tracks}
                bothLabel={bothLabel}
            />
        )
    }

    return (
        <ol
            aria-label={label}
            className='mt-9 [--pm-rail-x:0.625rem] md:mt-10 md:[--pm-rail-x:9.625rem]'
        >
            {milestones.map((milestone) => (
                <li
                    key={milestone.when}
                    className='pm-milestone grid pb-6 pl-8 tabular-nums md:grid-cols-[8rem_minmax(0,1fr)] md:gap-x-[3.25rem] md:pb-7 md:pl-0'
                >
                    <p className='text-[0.9375rem] leading-normal font-bold text-stone-900 md:text-base md:leading-[1.6]'>
                        {milestone.when}
                    </p>
                    <p className='mt-1 text-[1.0625rem] leading-[1.6] text-stone-700 md:mt-0 md:leading-[1.65]'>
                        {milestone.body}
                    </p>
                </li>
            ))}
        </ol>
    )
}

/** Where a stage sits from `md`: its own track's lane, or across both. */
const LANE = {
    first: 'md:col-start-2',
    second: 'md:col-start-3',
    both: 'md:col-span-2 md:col-start-2',
} as const

/**
 * Two recoveries on one time axis. Stages that share a `when` are one point
 * on the rule; each says which track it belongs to.
 *
 * From `md` the tracks are two lanes under their names, and a stage for
 * both spans the two. On a phone the lanes stack under the time, each
 * stage under its track's name ("Abdomen", "Breasts", "Abdomen and
 * breasts"), so nothing depends on a column a narrow screen can't show.
 * The names stay in the text for screen readers at every width; from `md`
 * they are visually hidden, since the lane headings say the same.
 */
function ModuleTrackedTimeline({
    label,
    milestones,
    tracks,
    bothLabel,
}: {
    label: string
    milestones: ModuleMilestone[]
    tracks: [ModuleTimelineTrack, ModuleTimelineTrack]
    bothLabel?: string
}) {
    const [first, second] = tracks
    const keys = new Set(tracks.map((track) => track.key))

    // Consecutive stages with the same `when` are one point in time.
    const points: { when: string; stages: ModuleMilestone[] }[] = []
    for (const milestone of milestones) {
        for (const key of milestone.tracks ?? []) {
            if (!keys.has(key)) {
                throw new Error(
                    `ModuleTimeline stage "${milestone.when}" names track "${key}", which is not one of ${[...keys].join(', ')}`
                )
            }
        }
        const last = points.at(-1)
        if (last?.when === milestone.when) last.stages.push(milestone)
        else points.push({ when: milestone.when, stages: [milestone] })
    }

    const laneOf = (stage: ModuleMilestone): keyof typeof LANE => {
        const inFirst = !stage.tracks || stage.tracks.includes(first.key)
        const inSecond = !stage.tracks || stage.tracks.includes(second.key)
        if (inFirst && inSecond) return 'both'
        return inFirst ? 'first' : 'second'
    }
    const LANE_NAMES = {
        first: first.label,
        second: second.label,
        both: bothLabel ?? `${first.label} and ${second.label.toLowerCase()}`,
    }

    return (
        <div className='mt-9 md:mt-10'>
            <div
                aria-hidden='true'
                className='hidden border-b border-stone-200 pb-3 md:mb-6 md:grid md:grid-cols-[8rem_minmax(0,1fr)_minmax(0,1fr)] md:gap-x-[3.25rem]'
            >
                <span className='text-base leading-[1.45] font-bold text-stone-900 md:col-start-2'>
                    {first.label}
                </span>
                <span className='text-base leading-[1.45] font-bold text-stone-900 md:col-start-3'>
                    {second.label}
                </span>
            </div>
            <ol
                aria-label={label}
                className='[--pm-rail-x:0.625rem] md:[--pm-rail-x:9.625rem]'
            >
                {points.map((point) => (
                    <li
                        key={point.when}
                        className='pm-milestone grid pb-6 pl-8 tabular-nums md:grid-cols-[8rem_minmax(0,1fr)_minmax(0,1fr)] md:gap-x-[3.25rem] md:gap-y-4 md:pb-7 md:pl-0'
                    >
                        <p className='text-[0.9375rem] leading-normal font-bold text-stone-900 md:col-start-1 md:row-start-1 md:text-base md:leading-[1.6]'>
                            {point.when}
                        </p>
                        {point.stages.map((stage, index) => {
                            const lane = laneOf(stage)
                            return (
                                <div
                                    key={`${lane}-${index}`}
                                    className={`mt-2.5 md:mt-0 ${LANE[lane]}`}
                                >
                                    <p className='text-gold-700 text-[0.875rem] leading-[1.45] font-bold md:sr-only'>
                                        {LANE_NAMES[lane]}
                                    </p>
                                    <p className='mt-0.5 text-[1.0625rem] leading-[1.6] text-stone-700 md:mt-0 md:leading-[1.65]'>
                                        {stage.body}
                                    </p>
                                </div>
                            )
                        })}
                    </li>
                ))}
            </ol>
        </div>
    )
}

export type ModuleGuide = { label: string; href: string }

/**
 * The posts that own the details, under a lead link to the main guide. The
 * page summarizes; the blog explains.
 */
export function ModuleGuideLinks({
    main,
    guides,
}: {
    main: ModuleGuide
    guides: ModuleGuide[]
}) {
    return (
        <div className='mt-10 border-t border-stone-200 pt-7'>
            <Link
                href={main.href}
                className={cn(
                    moduleLink,
                    'font-serif text-xl leading-[1.3] md:text-[1.375rem]'
                )}
            >
                {main.label}
            </Link>
            <ul className='mt-3.5 grid gap-1 md:grid-cols-2 md:gap-x-8 md:gap-y-3'>
                {guides.map((guide) => (
                    <li key={guide.href}>
                        <Link
                            href={guide.href}
                            className={cn(
                                moduleLink,
                                'inline-flex min-h-10 items-center text-base leading-[1.45] md:min-h-0'
                            )}
                        >
                            {guide.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}

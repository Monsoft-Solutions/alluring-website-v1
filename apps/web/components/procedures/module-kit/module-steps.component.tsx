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

export type ModuleMilestone = { when: string; body: ReactNode }

/**
 * A recovery timeline. The rule and dots are drawn by `module-kit.css` from
 * the list items: the rule draws down and each dot fills as that stage
 * reaches the middle of the screen. Every figure in `body` must be a fact in
 * the page's facts file.
 */
export function ModuleTimeline({
    label,
    milestones,
}: {
    /** Names the list, e.g. "BBL recovery timeline". */
    label: string
    milestones: ModuleMilestone[]
}) {
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

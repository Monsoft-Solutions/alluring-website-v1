import type { ReactNode } from 'react'
import { Phone } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'

import { getPhoneLink, siteConfig } from '@/lib/data/site-config'

import {
    moduleButtonPrimary,
    moduleButtonSecondary,
    moduleContainer,
    moduleLabel,
} from './module-ui.constant'

export type ModuleJumpLink = { label: string; href: `#${string}` }

/** "On this page" links under the hero: plain anchors, no script. */
export function ModuleJumpNav({ links }: { links: ModuleJumpLink[] }) {
    return (
        <nav
            aria-label='On this page'
            className='border-y border-stone-200 bg-white'
        >
            <ul
                className={cn(
                    moduleContainer,
                    'flex gap-7 overflow-x-auto [scrollbar-width:none] md:gap-9'
                )}
            >
                {links.map((link) => (
                    <li key={link.href} className='shrink-0'>
                        <a
                            href={link.href}
                            className='inline-flex h-14 items-center px-0.5 text-[0.9375rem] font-bold text-stone-700 transition-colors hover:text-stone-900 md:h-16'
                        >
                            {link.label}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    )
}

export type ModuleFactRailProps = {
    /** Names the rail's landmark. Each rail on a page needs its own. */
    label: string
    /** The starting price as the page prints it, e.g. "$5,500". */
    startingAt: string
    /** The line under the price, e.g. "Most patients $5,500–$10,000, …". */
    priceNote: ReactNode
    /** The surgeon's name as the page prints it. */
    surgeonName: string
    /** ISO date of the page's last real update. */
    updatedOn?: string
}

/**
 * The desktop fact rail: the price, both calls to action, the surgeon and the
 * last update, pinned beside the reading column. Phones get the sticky bar
 * instead, so the rail is not rendered visible below `lg`.
 */
export function ModuleFactRail({
    label,
    startingAt,
    priceNote,
    surgeonName,
    updatedOn,
}: ModuleFactRailProps) {
    return (
        <aside
            aria-label={label}
            className='border-t-gold-400 sticky top-40 flex flex-col gap-5.5 border border-t-[3px] border-stone-200 bg-white px-7 pt-7 pb-6'
        >
            <div className='flex flex-col gap-2'>
                <p className={moduleLabel}>Starting at</p>
                <p className='font-serif text-[2.75rem] leading-none text-stone-900 tabular-nums'>
                    {startingAt}
                </p>
                <p className='text-[0.9375rem] leading-normal text-stone-700 tabular-nums'>
                    {priceNote}
                </p>
            </div>
            <div className='flex flex-col gap-2.5'>
                <a href='#book' className={cn(moduleButtonPrimary, 'w-full')}>
                    Book a free consultation
                </a>
                <a
                    href={getPhoneLink()}
                    data-copy-check='data'
                    className={cn(moduleButtonSecondary, 'w-full tabular-nums')}
                >
                    <Phone aria-hidden='true' className='size-[1.125rem]' />
                    Call {siteConfig.contact.phoneDisplay}
                </a>
            </div>
            <div className='flex flex-col gap-2 border-t border-stone-200 pt-4.5'>
                <p className={moduleLabel}>Your surgeon</p>
                <p className='text-[0.9375rem] text-stone-900'>{surgeonName}</p>
            </div>
            {updatedOn && (
                <p
                    className={cn(moduleLabel, 'text-sm')}
                    data-copy-check='data'
                >
                    Last updated <ModuleDate iso={updatedOn} />
                </p>
            )}
        </aside>
    )
}

/**
 * A white band of sections read in one column, with the fact rail beside
 * them from `lg`. The rail's column stretches to the band's height, so the
 * rail stays pinned for as long as the band is on screen. Pass the page's
 * `ModuleFactRail` (or any rail of its own) as `rail`.
 */
export function ModuleBand({
    children,
    rail,
    className,
}: {
    children: ReactNode
    rail: ReactNode
    className?: string
}) {
    return (
        <div className={cn('bg-white', className)}>
            <div
                className={cn(
                    moduleContainer,
                    'lg:grid lg:grid-cols-[minmax(0,45rem)_20rem] lg:justify-between lg:gap-x-16'
                )}
            >
                <div className='min-w-0 divide-y divide-stone-200'>
                    {children}
                </div>
                <div className='hidden py-20 lg:block'>{rail}</div>
            </div>
        </div>
    )
}

/** A date as the page prints it: "September 18, 2026". */
export function ModuleDate({ iso }: { iso: string }) {
    return (
        <time dateTime={iso}>
            {new Date(iso).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'UTC',
            })}
        </time>
    )
}

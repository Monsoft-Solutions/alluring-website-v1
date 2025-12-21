'use client'

import { cn } from '@workspace/ui/lib/utils'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

import type { NavItem } from '@/lib/types/sidebar.type'

type NavListProps = {
    items: NavItem[]
    pathname: string
    isCollapsed: boolean
    expandedItems: string[]
    toggleExpanded: (title: string) => void
    isActive: (href: string) => boolean
    onNavigate?: () => void
}

export function NavList({
    items,
    pathname,
    isCollapsed,
    expandedItems,
    toggleExpanded,
    isActive,
    onNavigate,
}: NavListProps) {
    return (
        <ul className='space-y-1'>
            {items.map((item) => (
                <li key={item.title}>
                    {item.children ? (
                        <div>
                            <button
                                onClick={() => toggleExpanded(item.title)}
                                className={cn(
                                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                    isActive(item.href)
                                        ? 'bg-stone-100 text-stone-900'
                                        : 'text-muted-foreground hover:bg-stone-50 hover:text-stone-900',
                                    isCollapsed && 'justify-center px-2'
                                )}
                            >
                                <item.icon className='h-5 w-5 shrink-0' />
                                {!isCollapsed && (
                                    <>
                                        <span className='flex-1 text-left'>
                                            {item.title}
                                        </span>
                                        <ChevronRight
                                            className={cn(
                                                'h-4 w-4 transition-transform',
                                                expandedItems.includes(
                                                    item.title
                                                ) && 'rotate-90'
                                            )}
                                        />
                                    </>
                                )}
                            </button>
                            {!isCollapsed &&
                                expandedItems.includes(item.title) && (
                                    <ul className='mt-1 ml-4 space-y-1 border-l pl-4'>
                                        {item.children.map((child) => (
                                            <li key={child.href}>
                                                <Link
                                                    href={child.href}
                                                    onClick={onNavigate}
                                                    className={cn(
                                                        'flex items-center rounded-lg px-3 py-2 text-sm transition-colors',
                                                        pathname === child.href
                                                            ? 'bg-stone-100 font-medium text-stone-900'
                                                            : 'text-muted-foreground hover:bg-stone-50 hover:text-stone-900'
                                                    )}
                                                >
                                                    {child.title}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                        </div>
                    ) : (
                        <Link
                            href={item.href}
                            onClick={onNavigate}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                isActive(item.href)
                                    ? 'bg-stone-100 text-stone-900'
                                    : 'text-muted-foreground hover:bg-stone-50 hover:text-stone-900',
                                isCollapsed && 'justify-center px-2'
                            )}
                            title={isCollapsed ? item.title : undefined}
                        >
                            <item.icon className='h-5 w-5 shrink-0' />
                            {!isCollapsed && <span>{item.title}</span>}
                        </Link>
                    )}
                </li>
            ))}
        </ul>
    )
}

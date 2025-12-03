'use client'

import { cn } from '@workspace/ui/lib/utils'
import {
    FileText,
    Home,
    Mail,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@workspace/ui/components/button'

type NavItem = {
    title: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    children?: { title: string; href: string }[]
}

const navItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/',
        icon: Home,
    },
    {
        title: 'Blog',
        href: '/blog',
        icon: FileText,
        children: [
            { title: 'Posts', href: '/blog/posts' },
            { title: 'Authors', href: '/blog/authors' },
        ],
    },
    {
        title: 'Feedback',
        href: '/feedback',
        icon: MessageSquare,
    },
    {
        title: 'Contacts',
        href: '/contacts',
        icon: Mail,
    },
]

export function Sidebar() {
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [expandedItems, setExpandedItems] = useState<string[]>(['Blog'])

    const toggleExpanded = (title: string) => {
        setExpandedItems((prev) =>
            prev.includes(title)
                ? prev.filter((item) => item !== title)
                : [...prev, title]
        )
    }

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/'
        return pathname.startsWith(href)
    }

    return (
        <aside
            className={cn(
                'bg-card relative flex h-screen flex-col border-r transition-all duration-300',
                isCollapsed ? 'w-16' : 'w-64'
            )}
        >
            {/* Logo */}
            <div className='flex h-16 items-center border-b px-4'>
                {!isCollapsed && (
                    <Link href='/' className='flex items-center gap-2'>
                        <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900'>
                            <span className='text-sm font-bold text-stone-50'>
                                A
                            </span>
                        </div>
                        <span className='font-semibold'>Admin</span>
                    </Link>
                )}
                {isCollapsed && (
                    <div className='flex w-full justify-center'>
                        <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900'>
                            <span className='text-sm font-bold text-stone-50'>
                                A
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className='flex-1 overflow-y-auto p-4'>
                <ul className='space-y-1'>
                    {navItems.map((item) => (
                        <li key={item.title}>
                            {item.children ? (
                                <div>
                                    <button
                                        onClick={() =>
                                            toggleExpanded(item.title)
                                        }
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
                                                            className={cn(
                                                                'flex items-center rounded-lg px-3 py-2 text-sm transition-colors',
                                                                pathname ===
                                                                    child.href
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
            </nav>

            {/* Collapse toggle */}
            <div className='border-t p-4'>
                <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className='w-full'
                >
                    {isCollapsed ? (
                        <ChevronRight className='h-4 w-4' />
                    ) : (
                        <>
                            <ChevronLeft className='mr-2 h-4 w-4' />
                            Collapse
                        </>
                    )}
                </Button>
            </div>
        </aside>
    )
}

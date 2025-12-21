'use client'

import { cn } from '@workspace/ui/lib/utils'
import {
    BarChart3,
    FileText,
    Home,
    ImageIcon,
    Instagram,
    Mail,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
    Send,
    Megaphone,
    Bot,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@workspace/ui/components/button'

import { NavList } from './nav-list.component'
import { MobileSidebar } from './mobile-sidebar.component'
import type { NavItem } from '@/lib/types/layout/sidebar.type'

const navItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/',
        icon: Home,
    },
    {
        title: 'Analytics',
        href: '/analytics',
        icon: BarChart3,
    },
    {
        title: 'Promotions',
        href: '/promotions',
        icon: Megaphone,
    },
    {
        title: 'Gallery',
        href: '/gallery',
        icon: ImageIcon,
        children: [
            { title: 'Dashboard', href: '/gallery' },
            { title: 'Media Library', href: '/gallery/media' },
            { title: 'Groups', href: '/gallery/groups' },
            { title: 'Before & After', href: '/gallery/before-after' },
        ],
    },
    {
        title: 'Social Media',
        href: '/social-media',
        icon: Instagram,
        children: [
            { title: 'Dashboard', href: '/social-media' },
            { title: 'Instagram Posts', href: '/social-media/instagram' },
            { title: 'Bulk Analysis', href: '/social-media/instagram/analyze' },
            { title: 'Settings', href: '/social-media/settings' },
        ],
    },
    {
        title: 'Chat',
        href: '/chat',
        icon: Bot,
        children: [
            { title: 'Dashboard', href: '/chat' },
            { title: 'Conversations', href: '/chat/conversations' },
            { title: 'Test Chat', href: '/chat/test' },
        ],
    },
    {
        title: 'Blog',
        href: '/blog',
        icon: FileText,
        children: [
            { title: 'Posts', href: '/blog/posts' },
            { title: 'Authors', href: '/blog/authors' },
            { title: 'Categories', href: '/blog/categories' },
            { title: 'Tags', href: '/blog/tags' },
        ],
    },
    {
        title: 'Contacts',
        href: '/contacts',
        icon: Mail,
    },
    {
        title: 'Emails',
        href: '/emails',
        icon: Send,
    },
    {
        title: 'Feedback',
        href: '/feedback',
        icon: MessageSquare,
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
        <>
            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    'bg-card relative hidden h-screen flex-col border-r transition-all duration-300 lg:flex',
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
                    <NavList
                        items={navItems}
                        pathname={pathname}
                        isCollapsed={isCollapsed}
                        expandedItems={expandedItems}
                        toggleExpanded={toggleExpanded}
                        isActive={isActive}
                    />
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

            {/* Mobile Sidebar Trigger */}
            <MobileSidebar
                navItems={navItems}
                pathname={pathname}
                expandedItems={expandedItems}
                toggleExpanded={toggleExpanded}
                isActive={isActive}
            />
        </>
    )
}

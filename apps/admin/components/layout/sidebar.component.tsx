'use client'

import { cn } from '@workspace/ui/lib/utils'
import {
    BarChart3,
    FileText,
    Home,
    ImageIcon,
    Mail,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
    Send,
    Menu,
    X,
    Megaphone,
    Bot,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

import { Button } from '@workspace/ui/components/button'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@workspace/ui/components/sheet'

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
                pathname={pathname}
                expandedItems={expandedItems}
                toggleExpanded={toggleExpanded}
                isActive={isActive}
            />
        </>
    )
}

function MobileSidebar({
    pathname,
    expandedItems,
    toggleExpanded,
    isActive,
}: {
    pathname: string
    expandedItems: string[]
    toggleExpanded: (title: string) => void
    isActive: (href: string) => boolean
}) {
    const [open, setOpen] = useState(false)

    // Close sidebar on navigation
    useEffect(() => {
        setOpen(false)
    }, [pathname])

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant='ghost'
                    size='icon'
                    className='fixed top-4 left-4 z-50 lg:hidden'
                >
                    <Menu className='h-5 w-5' />
                    <span className='sr-only'>Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side='left' className='w-72 p-0'>
                <SheetHeader className='border-b p-4'>
                    <SheetTitle className='flex items-center gap-2'>
                        <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900'>
                            <span className='text-sm font-bold text-stone-50'>
                                A
                            </span>
                        </div>
                        <span>Admin Dashboard</span>
                    </SheetTitle>
                </SheetHeader>
                <nav className='p-4'>
                    <NavList
                        items={navItems}
                        pathname={pathname}
                        isCollapsed={false}
                        expandedItems={expandedItems}
                        toggleExpanded={toggleExpanded}
                        isActive={isActive}
                        onNavigate={() => setOpen(false)}
                    />
                </nav>
            </SheetContent>
        </Sheet>
    )
}

type NavListProps = {
    items: NavItem[]
    pathname: string
    isCollapsed: boolean
    expandedItems: string[]
    toggleExpanded: (title: string) => void
    isActive: (href: string) => boolean
    onNavigate?: () => void
}

function NavList({
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

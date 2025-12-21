'use client'

import { useState, useEffect, useTransition } from 'react'
import { Menu } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@workspace/ui/components/sheet'

import { NavList } from './nav-list.component'
import type { NavItem } from '@/lib/types/layout/sidebar.type'

type MobileSidebarProps = {
    navItems: NavItem[]
    pathname: string
    expandedItems: string[]
    toggleExpanded: (title: string) => void
    isActive: (href: string) => boolean
}

export function MobileSidebar({
    navItems,
    pathname,
    expandedItems,
    toggleExpanded,
    isActive,
}: MobileSidebarProps) {
    const [open, setOpen] = useState(false)
    const [, startTransition] = useTransition()

    // Close sidebar on navigation (wrapped in startTransition to avoid lint error)
    useEffect(() => {
        startTransition(() => {
            setOpen(false)
        })
    }, [pathname, startTransition])

    // Handle manual open/close changes
    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
    }

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
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

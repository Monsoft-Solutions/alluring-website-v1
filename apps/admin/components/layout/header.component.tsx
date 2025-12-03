'use client'

import { Button } from '@workspace/ui/components/button'
import { LogOut, Menu } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

type HeaderProps = {
    title?: string
    onMenuClick?: () => void
}

export function Header({ title = 'Dashboard', onMenuClick }: HeaderProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    async function handleLogout() {
        startTransition(async () => {
            await fetch('/api/auth', { method: 'DELETE' })
            router.push('/login')
            router.refresh()
        })
    }

    return (
        <header className='bg-card flex h-16 items-center justify-between border-b px-6'>
            <div className='flex items-center gap-4'>
                {onMenuClick && (
                    <Button
                        variant='ghost'
                        size='icon'
                        className='lg:hidden'
                        onClick={onMenuClick}
                    >
                        <Menu className='h-5 w-5' />
                        <span className='sr-only'>Toggle menu</span>
                    </Button>
                )}
                <h1 className='text-xl font-semibold'>{title}</h1>
            </div>

            <Button
                variant='ghost'
                size='sm'
                onClick={handleLogout}
                disabled={isPending}
                className='text-muted-foreground hover:text-foreground'
            >
                <LogOut className='mr-2 h-4 w-4' />
                Logout
            </Button>
        </header>
    )
}

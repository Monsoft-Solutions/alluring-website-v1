'use client'

import { Button } from '@workspace/ui/components/button'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

type HeaderProps = {
    title?: string
}

export function Header({ title = 'Dashboard' }: HeaderProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    async function handleLogout() {
        setIsLoggingOut(true)
        try {
            const response = await fetch('/api/auth', { method: 'DELETE' })

            if (!response.ok) {
                throw new Error('Logout failed')
            }

            startTransition(() => {
                router.push('/login')
                router.refresh()
            })
        } catch (error) {
            console.error('Logout error:', error)
            alert('Failed to logout. Please try again.')
            setIsLoggingOut(false)
        }
    }

    return (
        <header className='bg-card flex h-16 items-center justify-end border-b px-6 lg:justify-between'>
            <h1 className='hidden text-xl font-semibold lg:block'>{title}</h1>

            <Button
                variant='ghost'
                size='sm'
                onClick={handleLogout}
                disabled={isPending || isLoggingOut}
                className='text-muted-foreground hover:text-foreground'
            >
                <LogOut className='mr-2 h-4 w-4' />
                <span className='hidden sm:inline'>Logout</span>
            </Button>
        </header>
    )
}

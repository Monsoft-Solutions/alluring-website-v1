'use client'

import { Button } from '@workspace/ui/components/button'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { Lock, Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState, useTransition } from 'react'

const getSafeRedirectPath = (path: string | null): string => {
    if (!path) return '/'

    // 1. Basic string validation
    if (!path.startsWith('/') || path.startsWith('//')) {
        return '/'
    }

    try {
        // 2. Parsing and normalization using URL
        // We use a dummy base to check if the path attempts to change origin
        const dummyBase = 'http://localhost'
        const url = new URL(path, dummyBase)

        // 3. Explicit checks
        // If origin changes, it's an absolute URL or protocol-relative URL
        if (url.origin !== dummyBase) {
            return '/'
        }

        // Return the valid relative path
        return path
    } catch {
        // If parsing fails, fallback to safe default
        return '/'
    }
}

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isPending, startTransition] = useTransition()

    const redirectTo = getSafeRedirectPath(searchParams.get('redirect'))

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')

        startTransition(async () => {
            try {
                const response = await fetch('/api/auth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password }),
                })

                const data = await response.json()

                if (!response.ok) {
                    setError(data.error || 'Authentication failed')
                    return
                }

                router.push(redirectTo)
                router.refresh()
            } catch {
                setError('An error occurred. Please try again.')
            }
        })
    }

    return (
        <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
                <Label htmlFor='password'>Password</Label>
                <Input
                    id='password'
                    type='password'
                    placeholder='Enter admin password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isPending}
                    autoFocus
                />
            </div>

            {error && (
                <div className='bg-destructive/10 text-destructive rounded-md p-3 text-sm'>
                    {error}
                </div>
            )}

            <Button
                type='submit'
                className='w-full'
                disabled={isPending || !password}
            >
                {isPending ? (
                    <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Signing in...
                    </>
                ) : (
                    'Sign in'
                )}
            </Button>
        </form>
    )
}

function LoginFormSkeleton() {
    return (
        <div className='space-y-4'>
            <div className='space-y-2'>
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-10 w-full' />
            </div>
            <Skeleton className='h-10 w-full' />
        </div>
    )
}

export default function LoginPage() {
    return (
        <div className='flex min-h-screen items-center justify-center bg-linear-to-br from-stone-100 to-stone-200 p-4'>
            <Card className='w-full max-w-md shadow-xl'>
                <CardHeader className='space-y-1 text-center'>
                    <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-stone-900'>
                        <Lock className='h-6 w-6 text-stone-50' />
                    </div>
                    <CardTitle className='text-2xl font-semibold tracking-tight'>
                        Admin Dashboard
                    </CardTitle>
                    <p className='text-muted-foreground text-sm'>
                        Enter your password to access the dashboard
                    </p>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<LoginFormSkeleton />}>
                        <LoginForm />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    )
}

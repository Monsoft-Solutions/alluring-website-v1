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
import { Lock, Loader2, Mail, User, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState, useTransition, useEffect } from 'react'

import { signUp, organization } from '@/lib/auth-client'

function SignupForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [isPending, startTransition] = useTransition()

    const invitationId = searchParams.get('invitation')

    // If no invitation ID, show error
    useEffect(() => {
        if (!invitationId) {
            setError('Registration requires a valid invitation link.')
        }
    }, [invitationId])

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        // Validate password length
        if (password.length < 8) {
            setError('Password must be at least 8 characters')
            return
        }

        if (!invitationId) {
            setError('Registration requires a valid invitation link.')
            return
        }

        startTransition(async () => {
            try {
                // Sign up the user
                const { error: signUpError } = await signUp.email({
                    email,
                    password,
                    name,
                })

                if (signUpError) {
                    setError(signUpError.message || 'Failed to create account')
                    return
                }

                // Accept the invitation after signup
                const { error: acceptError } =
                    await organization.acceptInvitation({
                        invitationId,
                    })

                if (acceptError) {
                    // User is created but invitation acceptance failed
                    // They can still log in, but might not be in the org
                    console.error('Failed to accept invitation:', acceptError)
                }

                router.push('/')
                router.refresh()
            } catch {
                setError('An error occurred. Please try again.')
            }
        })
    }

    // Show error state if no invitation
    if (!invitationId) {
        return (
            <div className='space-y-4 text-center'>
                <div className='bg-destructive/10 text-destructive flex items-center gap-2 rounded-md p-4'>
                    <AlertCircle className='h-5 w-5 flex-shrink-0' />
                    <p className='text-sm'>
                        Registration requires a valid invitation link. Please
                        contact an administrator.
                    </p>
                </div>
                <Button variant='outline' asChild className='w-full'>
                    <Link href='/login'>Back to Login</Link>
                </Button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
                <Label htmlFor='name'>Full Name</Label>
                <div className='relative'>
                    <User className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                    <Input
                        id='name'
                        type='text'
                        placeholder='John Doe'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isPending}
                        className='pl-10'
                        autoComplete='name'
                        autoFocus
                        required
                    />
                </div>
            </div>

            <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <div className='relative'>
                    <Mail className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                    <Input
                        id='email'
                        type='email'
                        placeholder='you@example.com'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isPending}
                        className='pl-10'
                        autoComplete='email'
                        required
                    />
                </div>
            </div>

            <div className='space-y-2'>
                <Label htmlFor='password'>Password</Label>
                <div className='relative'>
                    <Lock className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                    <Input
                        id='password'
                        type='password'
                        placeholder='At least 8 characters'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isPending}
                        className='pl-10'
                        autoComplete='new-password'
                        required
                        minLength={8}
                    />
                </div>
            </div>

            <div className='space-y-2'>
                <Label htmlFor='confirmPassword'>Confirm Password</Label>
                <div className='relative'>
                    <Lock className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                    <Input
                        id='confirmPassword'
                        type='password'
                        placeholder='Confirm your password'
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isPending}
                        className='pl-10'
                        autoComplete='new-password'
                        required
                    />
                </div>
            </div>

            {error && (
                <div className='bg-destructive/10 text-destructive rounded-md p-3 text-sm'>
                    {error}
                </div>
            )}

            <Button
                type='submit'
                className='w-full rounded bg-stone-900 px-4 py-2 text-white disabled:opacity-50'
                disabled={
                    isPending ||
                    !name ||
                    !email ||
                    !password ||
                    !confirmPassword
                }
            >
                {isPending ? (
                    <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Creating account...
                    </>
                ) : (
                    'Create Account'
                )}
            </Button>

            <p className='text-muted-foreground text-center text-sm'>
                Already have an account?{' '}
                <Link href='/login' className='text-stone-900 hover:underline'>
                    Sign in
                </Link>
            </p>
        </form>
    )
}

function SignupFormSkeleton() {
    return (
        <div className='space-y-4'>
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className='space-y-2'>
                    <div className='bg-muted h-4 w-20 animate-pulse rounded' />
                    <div className='bg-muted h-10 w-full animate-pulse rounded' />
                </div>
            ))}
            <div className='bg-muted h-10 w-full animate-pulse rounded' />
        </div>
    )
}

export default function SignupPage() {
    return (
        <div className='flex min-h-screen items-center justify-center bg-linear-to-br from-stone-100 to-stone-200 p-4'>
            <Card className='w-full max-w-md shadow-xl'>
                <CardHeader className='space-y-1 text-center'>
                    <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-stone-900'>
                        <User className='h-6 w-6 text-stone-50' />
                    </div>
                    <CardTitle className='text-2xl font-semibold tracking-tight'>
                        Create Account
                    </CardTitle>
                    <p className='text-muted-foreground text-sm'>
                        Complete your registration to access the admin dashboard
                    </p>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<SignupFormSkeleton />}>
                        <SignupForm />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    )
}

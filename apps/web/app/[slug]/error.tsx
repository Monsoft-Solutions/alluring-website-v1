'use client'

/**
 * Root-Slug Error Boundary
 *
 * Covers the pre-2026 blog posts and the surgeon pages, both of which are
 * served from `/[slug]`.
 *
 * The 49 legacy posts render through the same unsanitised MDX pipeline as the
 * `/blog/[slug]` route, so they carry the same failure mode: a malformed
 * construct in a post body throws during render. Write-time validation is what
 * prevents it; this boundary makes the failure a readable page rather than an
 * unhandled 500 on an indexed URL.
 */
import { useEffect } from 'react'
import Link from 'next/link'

import { Button } from '@workspace/ui/components/button'

type SlugPageErrorProps = {
    error: Error & { digest?: string }
    reset: () => void
}

export default function SlugPageError({ error, reset }: SlugPageErrorProps) {
    useEffect(() => {
        console.error('[Root slug] Render failed:', error.message, error.digest)
    }, [error])

    return (
        <main className='flex min-h-[60vh] items-center justify-center px-5 py-24'>
            <div className='max-w-lg text-center'>
                <div className='bg-gold-500 mx-auto mb-8 h-1 w-24' />
                <h1 className='mb-5 font-serif text-3xl font-medium text-stone-900 md:text-4xl'>
                    This page didn&apos;t load
                </h1>
                <p className='mb-9 leading-relaxed text-stone-600'>
                    Something went wrong displaying this page. The rest of the
                    site is working — try again, or start from the homepage.
                </p>
                <div className='flex flex-wrap items-center justify-center gap-4'>
                    <Button onClick={reset} variant='gold' size='lg'>
                        Try again
                    </Button>
                    <Button asChild variant='outline' size='lg'>
                        <Link href='/'>Go to homepage</Link>
                    </Button>
                </div>
            </div>
        </main>
    )
}

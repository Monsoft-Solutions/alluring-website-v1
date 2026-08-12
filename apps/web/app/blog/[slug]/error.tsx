'use client'

/**
 * Blog Post Error Boundary
 *
 * Last line of defence for a post whose body cannot be rendered.
 *
 * The blog renderer runs MDX without a sanitizer so custom components work,
 * which means a malformed construct in a post body throws during render rather
 * than degrading. Write-time validation
 * (`packages/ai/src/functions/validate-generated-mdx.function.ts`) is what
 * actually prevents that; this boundary exists so the failure mode is one
 * readable page with a way out, instead of an unhandled 500 on a URL that
 * search engines and AI crawlers are actively fetching.
 */
import { useEffect } from 'react'
import Link from 'next/link'

import { Button } from '@workspace/ui/components/button'

type BlogPostErrorProps = {
    error: Error & { digest?: string }
    reset: () => void
}

export default function BlogPostError({ error, reset }: BlogPostErrorProps) {
    useEffect(() => {
        // Surfaced in the server logs with the digest so the failing post can be
        // traced back to a specific render.
        console.error('[Blog post] Render failed:', error.message, error.digest)
    }, [error])

    return (
        <main className='flex min-h-[60vh] items-center justify-center px-5 py-24'>
            <div className='max-w-lg text-center'>
                <div className='bg-gold-500 mx-auto mb-8 h-1 w-24' />
                <h1 className='mb-5 font-serif text-3xl font-medium text-stone-900 md:text-4xl'>
                    This article didn&apos;t load
                </h1>
                <p className='mb-9 leading-relaxed text-stone-600'>
                    Something went wrong displaying this page. The rest of the
                    site is working — try again, or browse our other articles.
                </p>
                <div className='flex flex-wrap items-center justify-center gap-4'>
                    <Button onClick={reset} variant='gold' size='lg'>
                        Try again
                    </Button>
                    <Button asChild variant='outline' size='lg'>
                        <Link href='/blog'>Browse all articles</Link>
                    </Button>
                </div>
            </div>
        </main>
    )
}

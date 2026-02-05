'use client'

import Link from 'next/link'
import { siteConfig } from '@/lib/data/site-config'

export default function QuizError({
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <section className='relative min-h-screen bg-gradient-to-b from-stone-50 to-white py-12 md:py-20'>
            {/* Decorative background elements (matches quiz page) */}
            <div className='pointer-events-none absolute inset-0 overflow-hidden'>
                <div className='bg-gold-100/30 absolute -top-40 -right-40 h-80 w-80 rounded-full blur-3xl' />
                <div className='bg-gold-100/20 absolute -bottom-40 -left-40 h-80 w-80 rounded-full blur-3xl' />
            </div>

            <div className='relative mx-auto flex max-w-lg flex-col items-center px-4 pt-24 text-center sm:px-6 lg:px-8'>
                <div className='bg-gold-500/10 mb-6 flex h-16 w-16 items-center justify-center rounded-full'>
                    <svg
                        className='text-gold-600 h-8 w-8'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                        strokeWidth={1.5}
                    >
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z'
                        />
                    </svg>
                </div>

                <h1 className='mb-3 font-serif text-3xl font-medium text-stone-900'>
                    Something Went Wrong
                </h1>
                <p className='mb-8 text-lg leading-relaxed text-stone-600'>
                    We had trouble loading the quiz. This is usually temporary
                    &mdash; please try again or reach out to us directly.
                </p>

                <div className='flex flex-col gap-4 sm:flex-row'>
                    <button
                        onClick={reset}
                        className='bg-gold-500 hover:bg-gold-600 inline-flex items-center justify-center rounded-xl px-8 py-3.5 text-sm font-bold text-white transition-colors'
                    >
                        Try Again
                    </button>
                    <Link
                        href='/contact-us'
                        className='inline-flex items-center justify-center rounded-xl border border-stone-300 bg-white px-8 py-3.5 text-sm font-bold text-stone-900 transition-colors hover:bg-stone-50'
                    >
                        Contact Us
                    </Link>
                </div>

                <p className='mt-8 text-sm text-stone-500'>
                    Or call us at{' '}
                    <Link
                        href={`tel:${siteConfig.contact.phone.replace(/[^0-9]/g, '')}`}
                        className='text-gold-600 hover:text-gold-700 font-medium'
                    >
                        {siteConfig.contact.phoneDisplay}
                    </Link>
                </p>
            </div>
        </section>
    )
}

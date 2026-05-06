/**
 * DrKarlinskyMinimalFooter
 *
 * Single-strip legal footer for the ad landing page. Required-only links:
 *   - Privacy Policy and Terms (legally necessary for FTC + paid-ad platforms)
 *   - Address + copyright + phone
 *
 * Privacy/Terms are the only outbound links — required by Meta and Google ad
 * policy compliance, and they open in the same tab so abandonment is rare.
 */
import Link from 'next/link'

import { siteConfig } from '@/lib/data/site-config'

export function DrKarlinskyMinimalFooter() {
    const year = new Date().getFullYear()

    return (
        <footer className='border-t border-stone-200/70 bg-stone-50'>
            <div className='mx-auto flex w-full max-w-7xl flex-col items-center gap-3 px-6 py-6 text-center text-xs text-stone-500 sm:flex-row sm:justify-between sm:text-left md:px-8'>
                <p>
                    © {year} {siteConfig.business.name} ·{' '}
                    {siteConfig.contact.address}, {siteConfig.contact.city},{' '}
                    {siteConfig.contact.state} {siteConfig.contact.postalCode}
                </p>
                <nav
                    aria-label='Legal'
                    className='flex items-center gap-x-4 gap-y-1'
                >
                    <Link
                        href='/privacy'
                        className='hover:text-gold-700 transition-colors'
                    >
                        Privacy
                    </Link>
                    <span aria-hidden='true' className='text-stone-300'>
                        ·
                    </span>
                    <Link
                        href='/terms'
                        className='hover:text-gold-700 transition-colors'
                    >
                        Terms
                    </Link>
                </nav>
            </div>
        </footer>
    )
}

/**
 * Atelier Nav + Footer
 *
 * The current stone/gold header would sabotage this palette, so the
 * direction gets its own chrome. That is not scope creep — a redesign this
 * deep necessarily includes navigation, and judging the page under the old
 * header would tell you nothing.
 *
 * ---------------------------------------------------------------------
 * PALETTE (Atelier)
 *   Shell      #F6EDE4   page ground
 *   Blush      #E5B9A6   secondary surface
 *   Terracotta #C4674D   accent, CTAs, links
 *   Cacao      #3D2B23   ink
 *   Bark       #2A1D17   dark surfaces (forms, footer)
 * ---------------------------------------------------------------------
 *
 * Server-rendered apart from the tracked phone link.
 */
import Link from 'next/link'
import { Phone } from 'lucide-react'

import { TrackedLink } from '@/components/analytics/tracked-link.component'
import { getPhoneLink, siteConfig } from '@/lib/data/site-config'

const NAV_LINKS: readonly { readonly label: string; readonly href: string }[] =
    [
        { label: 'Procedures', href: '/procedures' },
        { label: 'Results', href: '/gallery' },
        { label: 'Surgeons', href: '/about' },
        { label: 'Financing', href: '/plastic-surgery-financing-miami' },
    ] as const

export function AtelierNav() {
    return (
        <header className='sticky top-0 z-50 border-b border-[#3D2B23]/10 bg-[#F6EDE4]/90 backdrop-blur-md'>
            <nav
                className='mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10'
                aria-label='Main'
            >
                <Link
                    href='/'
                    className='font-[family-name:var(--font-fraunces)] text-2xl tracking-tight text-[#3D2B23]'
                >
                    Alluring
                </Link>

                <ul className='hidden items-center gap-9 lg:flex'>
                    {NAV_LINKS.map((link) => (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                className='text-sm text-[#3D2B23]/70 transition-colors hover:text-[#C4674D]'
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className='flex items-center gap-3'>
                    <TrackedLink
                        href={getPhoneLink()}
                        eventName='phone_click'
                        eventParams={{
                            cta_name: 'atelier_nav',
                            phone_number: siteConfig.contact.phoneDisplay,
                            page_section: 'nav',
                        }}
                        className='hidden items-center gap-2 text-sm text-[#3D2B23]/70 transition-colors hover:text-[#C4674D] sm:flex'
                    >
                        <Phone className='h-4 w-4' aria-hidden='true' />
                        {siteConfig.contact.phoneDisplay}
                    </TrackedLink>
                    <Link
                        href='#talk'
                        className='rounded-full bg-[#C4674D] px-5 py-2.5 text-sm font-medium text-[#F6EDE4] transition-colors hover:bg-[#a8543d]'
                    >
                        Book a consult
                    </Link>
                </div>
            </nav>
        </header>
    )
}

export function AtelierFooter() {
    return (
        <footer className='bg-[#2A1D17] px-6 py-16 text-[#F6EDE4] md:px-10 md:py-20'>
            <div className='mx-auto max-w-7xl'>
                <div className='grid gap-12 border-b border-[#F6EDE4]/15 pb-12 md:grid-cols-3'>
                    <div>
                        <p className='font-[family-name:var(--font-fraunces)] text-3xl'>
                            Alluring
                        </p>
                        <p className='mt-4 max-w-xs leading-relaxed text-[#F6EDE4]/60'>
                            Board-certified plastic surgery in Miami. Honest
                            prices, honest answers, and a plan built around your
                            body.
                        </p>
                    </div>

                    <div>
                        <h2 className='mb-4 text-xs tracking-[0.2em] text-[#E5B9A6] uppercase'>
                            Visit
                        </h2>
                        <address className='space-y-1 leading-relaxed text-[#F6EDE4]/60 not-italic'>
                            <p>{siteConfig.contact.address}</p>
                            <p>
                                {siteConfig.contact.city},{' '}
                                {siteConfig.contact.state}{' '}
                                {siteConfig.contact.postalCode}
                            </p>
                            <TrackedLink
                                href={getPhoneLink()}
                                eventName='phone_click'
                                eventParams={{
                                    cta_name: 'atelier_footer',
                                    phone_number:
                                        siteConfig.contact.phoneDisplay,
                                    page_section: 'footer',
                                }}
                                className='mt-3 inline-block text-[#E5B9A6] transition-colors hover:text-[#F6EDE4]'
                            >
                                {siteConfig.contact.phoneDisplay}
                            </TrackedLink>
                        </address>
                    </div>

                    <div>
                        <h2 className='mb-4 text-xs tracking-[0.2em] text-[#E5B9A6] uppercase'>
                            Explore
                        </h2>
                        <ul className='space-y-2'>
                            {NAV_LINKS.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className='text-[#F6EDE4]/60 transition-colors hover:text-[#F6EDE4]'
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <Link
                                    href='/contact-us'
                                    className='text-[#F6EDE4]/60 transition-colors hover:text-[#F6EDE4]'
                                >
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Disclosures. Kept legible rather than shrunk to grey
                    six-point — the fly-in boundary in particular is
                    information an out-of-state patient needs. */}
                <div className='space-y-3 pt-10 text-sm leading-relaxed text-[#F6EDE4]/45'>
                    <p>
                        Model shown; not a patient. Individual results vary.
                        Surgery carries risk and is not suitable for everyone.
                    </p>
                    <p>
                        Travelling in? We schedule your consultation, surgery
                        and follow-ups and tell you how many nights you need in
                        Miami. You book your own flights, lodging and transport
                        — we are not affiliated with any recovery house.
                    </p>
                    <p className='flex flex-wrap gap-x-5 gap-y-2 pt-3'>
                        <span>
                            © {new Date().getFullYear()}{' '}
                            {siteConfig.business.name}
                        </span>
                        <Link href='/privacy' className='hover:text-[#F6EDE4]'>
                            Privacy
                        </Link>
                        <Link href='/terms' className='hover:text-[#F6EDE4]'>
                            Terms
                        </Link>
                    </p>
                </div>
            </div>
        </footer>
    )
}

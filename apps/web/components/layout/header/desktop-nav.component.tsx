/**
 * Desktop Nav Component
 *
 * Desktop navigation bar with dropdowns and action buttons.
 */
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@workspace/ui/components/button'
import { surgeons } from '@/lib/data/surgeons/surgeons-data'
import { procedureNavItems } from '@/lib/data/procedure-nav.data'
import { getPhoneLink, contactInfo } from '@/lib/data/site-config'
import { consultCtaHref } from '@/lib/constants/standalone-routes'
import { NavDropdown } from './nav-dropdown.component'
import type { NavLink } from './header.type'
import { useAnalyticsEvent } from '@/lib/analytics/useAnalyticsEvent.hook'
import { TrackedLink } from '@/components/analytics/tracked-link.component'
import { LanguageSwitcher } from './language-switcher.component'

export function DesktopNav() {
    const [isSurgeonsDropdownOpen, setIsSurgeonsDropdownOpen] = useState(false)
    const [isProceduresDropdownOpen, setIsProceduresDropdownOpen] =
        useState(false)

    const { track } = useAnalyticsEvent()
    // On a lead page the button jumps to that page's own thread.
    const consultHref = consultCtaHref(usePathname())

    // Generate surgeon links dynamically
    const surgeonLinks: NavLink[] = surgeons.map((surgeon) => ({
        label: surgeon.name,
        href: `/${surgeon.slug}`,
    }))

    // Generate procedure links dynamically with "View All" at top
    const procedureLinks: NavLink[] = [
        {
            label: 'View All Procedures',
            href: '/procedures',
        },
        ...procedureNavItems.map((procedure) => ({
            label: procedure.title,
            href: `/procedures/${procedure.slug}`,
        })),
    ]

    const handleProceduresToggle = () => {
        const willOpen = !isProceduresDropdownOpen
        if (willOpen) {
            track('nav_dropdown_open', {
                dropdown_name: 'Procedures',
                nav_type: 'desktop',
            })
        }
        setIsProceduresDropdownOpen(willOpen)
    }

    const handleSurgeonsToggle = () => {
        const willOpen = !isSurgeonsDropdownOpen
        if (willOpen) {
            track('nav_dropdown_open', {
                dropdown_name: 'Surgeons',
                nav_type: 'desktop',
            })
        }
        setIsSurgeonsDropdownOpen(willOpen)
    }

    const handlePhoneClick = () => {
        track('nav_phone_click', {
            phone_number: contactInfo.phoneDisplay,
            nav_type: 'desktop',
        })
    }

    const handleCTAClick = () => {
        track('nav_cta_click', {
            cta_text: 'Request Consult',
            nav_type: 'desktop',
        })
    }

    return (
        <>
            {/* Desktop Nav */}
            <nav className='hidden items-center space-x-6 lg:flex xl:space-x-10'>
                {/* Procedures Dropdown */}
                <NavDropdown
                    label='Procedures'
                    links={procedureLinks}
                    isOpen={isProceduresDropdownOpen}
                    onToggle={handleProceduresToggle}
                    onClose={() => setIsProceduresDropdownOpen(false)}
                />

                {/* Surgeons Dropdown */}
                <NavDropdown
                    label='Surgeons'
                    links={surgeonLinks}
                    isOpen={isSurgeonsDropdownOpen}
                    onToggle={handleSurgeonsToggle}
                    onClose={() => setIsSurgeonsDropdownOpen(false)}
                />

                {/* Financing Link */}
                <TrackedLink
                    href='/plastic-surgery-financing-miami'
                    eventName='nav_click'
                    eventParams={{
                        nav_type: 'desktop',
                        link_category: 'financing',
                    }}
                    className='group relative text-[0.8125rem] font-semibold tracking-[0.14em] text-stone-600 uppercase transition-colors hover:text-stone-950'
                >
                    Financing
                    <span className='bg-gold-500 absolute -bottom-2 left-0 h-px w-0 transition-all duration-300 group-hover:w-full'></span>
                </TrackedLink>

                {/* Blog Link */}
                <TrackedLink
                    href='/blog'
                    eventName='nav_click'
                    eventParams={{
                        nav_type: 'desktop',
                        link_category: 'blog',
                    }}
                    className='group relative text-[0.8125rem] font-semibold tracking-[0.14em] text-stone-600 uppercase transition-colors hover:text-stone-950'
                >
                    Blog
                    <span className='bg-gold-500 absolute -bottom-2 left-0 h-px w-0 transition-all duration-300 group-hover:w-full'></span>
                </TrackedLink>

                {/* Gallery Link */}
                <TrackedLink
                    href='/gallery'
                    eventName='nav_click'
                    eventParams={{
                        nav_type: 'desktop',
                        link_category: 'gallery',
                    }}
                    className='group relative text-[0.8125rem] font-semibold tracking-[0.14em] text-stone-600 uppercase transition-colors hover:text-stone-950'
                >
                    Gallery
                    <span className='bg-gold-500 absolute -bottom-2 left-0 h-px w-0 transition-all duration-300 group-hover:w-full'></span>
                </TrackedLink>

                {/* About Link */}
                <TrackedLink
                    href='/about'
                    eventName='nav_click'
                    eventParams={{
                        nav_type: 'desktop',
                        link_category: 'about',
                    }}
                    className='group relative text-[0.8125rem] font-semibold tracking-[0.14em] text-stone-600 uppercase transition-colors hover:text-stone-950'
                >
                    About
                    <span className='bg-gold-500 absolute -bottom-2 left-0 h-px w-0 transition-all duration-300 group-hover:w-full'></span>
                </TrackedLink>

                {/* FAQ Link */}
                <TrackedLink
                    href='/faqs'
                    eventName='nav_click'
                    eventParams={{
                        nav_type: 'desktop',
                        link_category: 'faq',
                    }}
                    className='group relative text-[0.8125rem] font-semibold tracking-[0.14em] text-stone-600 uppercase transition-colors hover:text-stone-950'
                >
                    FAQ
                    <span className='bg-gold-500 absolute -bottom-2 left-0 h-px w-0 transition-all duration-300 group-hover:w-full'></span>
                </TrackedLink>
            </nav>

            {/* Language Switcher - Desktop */}
            <div className='hidden lg:flex'>
                <LanguageSwitcher mode='horizontal' />
            </div>

            {/* CTA Right */}
            <div className='hidden items-center space-x-4 lg:flex xl:space-x-8'>
                <Link
                    href={getPhoneLink()}
                    onClick={handlePhoneClick}
                    className='hidden items-center text-[0.8125rem] font-semibold tracking-[0.14em] text-stone-900 uppercase transition-colors hover:text-stone-600 2xl:flex'
                >
                    {contactInfo.phoneDisplay}
                </Link>
                <Button size='sm' variant='primary' asChild>
                    <Link href={consultHref} onClick={handleCTAClick}>
                        Request Consult
                    </Link>
                </Button>
            </div>
        </>
    )
}

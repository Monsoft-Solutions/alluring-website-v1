/**
 * Desktop Nav Component
 *
 * Desktop navigation bar with dropdowns and action buttons.
 */
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@workspace/ui/components/button'
import { surgeons } from '@/lib/data/surgeons/surgeons-data'
import { procedures } from '@/lib/data/procedures.data'
import { getPhoneLink, contactInfo } from '@/lib/data/site-config'
import { NavDropdown } from './nav-dropdown.component'
import { NavLink } from './header.type'
import { useAnalyticsEvent } from '@/lib/analytics/useAnalyticsEvent.hook'
import { TrackedLink } from '@/components/analytics/tracked-link.component'

export function DesktopNav() {
    const [isSurgeonsDropdownOpen, setIsSurgeonsDropdownOpen] = useState(false)
    const [isProceduresDropdownOpen, setIsProceduresDropdownOpen] =
        useState(false)

    const { track } = useAnalyticsEvent()

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
        ...procedures.map((procedure) => ({
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
            <nav className='hidden items-center space-x-10 lg:flex'>
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
                    className='hover:text-gold-500 group relative text-sm font-bold tracking-widest text-stone-500 uppercase transition-colors'
                >
                    Financing
                    <span className='bg-gold-400 absolute -bottom-2 left-0 h-px w-0 transition-all duration-300 group-hover:w-full'></span>
                </TrackedLink>

                {/* Blog Link */}
                <TrackedLink
                    href='/blog'
                    eventName='nav_click'
                    eventParams={{
                        nav_type: 'desktop',
                        link_category: 'blog',
                    }}
                    className='hover:text-gold-500 group relative text-sm font-bold tracking-widest text-stone-500 uppercase transition-colors'
                >
                    Blog
                    <span className='bg-gold-400 absolute -bottom-2 left-0 h-px w-0 transition-all duration-300 group-hover:w-full'></span>
                </TrackedLink>

                {/* Gallery Link */}
                <TrackedLink
                    href='/gallery'
                    eventName='nav_click'
                    eventParams={{
                        nav_type: 'desktop',
                        link_category: 'gallery',
                    }}
                    className='hover:text-gold-500 group relative text-sm font-bold tracking-widest text-stone-500 uppercase transition-colors'
                >
                    Gallery
                    <span className='bg-gold-400 absolute -bottom-2 left-0 h-px w-0 transition-all duration-300 group-hover:w-full'></span>
                </TrackedLink>

                {/* About Link */}
                <TrackedLink
                    href='/about'
                    eventName='nav_click'
                    eventParams={{
                        nav_type: 'desktop',
                        link_category: 'about',
                    }}
                    className='hover:text-gold-500 group relative text-sm font-bold tracking-widest text-stone-500 uppercase transition-colors'
                >
                    About
                    <span className='bg-gold-400 absolute -bottom-2 left-0 h-px w-0 transition-all duration-300 group-hover:w-full'></span>
                </TrackedLink>
            </nav>

            {/* CTA Right */}
            <div className='hidden items-center space-x-8 lg:flex'>
                <Link
                    href={getPhoneLink()}
                    onClick={handlePhoneClick}
                    className='hover:text-gold-500 flex items-center text-sm font-bold tracking-widest text-stone-900 uppercase transition-colors'
                >
                    {contactInfo.phoneDisplay}
                </Link>
                <Button size='sm' variant='primary' asChild>
                    <Link href='/contact-us' onClick={handleCTAClick}>
                        Request Consult
                    </Link>
                </Button>
            </div>
        </>
    )
}

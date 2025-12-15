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

export function DesktopNav() {
    const [isSurgeonsDropdownOpen, setIsSurgeonsDropdownOpen] = useState(false)
    const [isProceduresDropdownOpen, setIsProceduresDropdownOpen] =
        useState(false)

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

    return (
        <>
            {/* Desktop Nav */}
            <nav className='hidden items-center space-x-10 lg:flex'>
                {/* Procedures Dropdown */}
                <NavDropdown
                    label='Procedures'
                    links={procedureLinks}
                    isOpen={isProceduresDropdownOpen}
                    onToggle={() =>
                        setIsProceduresDropdownOpen(!isProceduresDropdownOpen)
                    }
                    onClose={() => setIsProceduresDropdownOpen(false)}
                />

                {/* Surgeons Dropdown */}
                <NavDropdown
                    label='Surgeons'
                    links={surgeonLinks}
                    isOpen={isSurgeonsDropdownOpen}
                    onToggle={() =>
                        setIsSurgeonsDropdownOpen(!isSurgeonsDropdownOpen)
                    }
                    onClose={() => setIsSurgeonsDropdownOpen(false)}
                />

                {/* Financing Link */}
                <Link
                    href='/plastic-surgery-financing-miami'
                    className='hover:text-gold-500 group relative text-sm font-bold tracking-widest text-stone-500 uppercase transition-colors'
                >
                    Financing
                    <span className='bg-gold-400 absolute -bottom-2 left-0 h-px w-0 transition-all duration-300 group-hover:w-full'></span>
                </Link>

                {/* Blog Link */}
                <Link
                    href='/blog'
                    className='hover:text-gold-500 group relative text-sm font-bold tracking-widest text-stone-500 uppercase transition-colors'
                >
                    Blog
                    <span className='bg-gold-400 absolute -bottom-2 left-0 h-px w-0 transition-all duration-300 group-hover:w-full'></span>
                </Link>

                {/* Gallery Link */}
                <Link
                    href='/gallery'
                    className='hover:text-gold-500 group relative text-sm font-bold tracking-widest text-stone-500 uppercase transition-colors'
                >
                    Gallery
                    <span className='bg-gold-400 absolute -bottom-2 left-0 h-px w-0 transition-all duration-300 group-hover:w-full'></span>
                </Link>

                {/* About Link */}
                <Link
                    href='/about'
                    className='hover:text-gold-500 group relative text-sm font-bold tracking-widest text-stone-500 uppercase transition-colors'
                >
                    About
                    <span className='bg-gold-400 absolute -bottom-2 left-0 h-px w-0 transition-all duration-300 group-hover:w-full'></span>
                </Link>
            </nav>

            {/* CTA Right */}
            <div className='hidden items-center space-x-8 lg:flex'>
                <Link
                    href={getPhoneLink()}
                    className='hover:text-gold-500 flex items-center text-sm font-bold tracking-widest text-stone-900 uppercase transition-colors'
                >
                    {contactInfo.phoneDisplay}
                </Link>
                <Button size='sm' variant='primary' asChild>
                    <Link href='/contact-us'>Request Consult</Link>
                </Button>
            </div>
        </>
    )
}

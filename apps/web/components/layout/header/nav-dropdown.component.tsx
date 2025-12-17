/**
 * Nav Dropdown Component
 *
 * Reusable dropdown navigation component for desktop header.
 * Used for both Procedures and Surgeons dropdowns.
 * Uses CSS animations for performance (no Framer Motion).
 */
'use client'

import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { NavDropdownProps } from './header.type'
import { useAnalyticsEvent } from '@/lib/analytics/useAnalyticsEvent.hook'

export function NavDropdown({
    label,
    links,
    isOpen,
    onToggle,
    onClose,
}: NavDropdownProps) {
    const { track } = useAnalyticsEvent()

    const handleLinkClick = (linkLabel: string, linkHref: string) => {
        track('nav_click', {
            link_text: linkLabel,
            link_url: linkHref,
            nav_type: 'desktop',
            link_category: label.toLowerCase(),
        })
        onClose()
    }

    return (
        <div
            className='group relative'
            onMouseEnter={onToggle}
            onMouseLeave={onClose}
        >
            <button
                onClick={onToggle}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onToggle()
                    } else if (e.key === 'Escape') {
                        onClose()
                    }
                }}
                aria-haspopup='true'
                aria-expanded={isOpen}
                className='hover:text-gold-500 group relative flex items-center text-sm font-bold tracking-widest text-stone-500 uppercase transition-colors'
            >
                {label}
                <ChevronDown
                    className={`ml-1 h-3 w-3 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                />
                <span className='bg-gold-400 absolute -bottom-2 left-0 h-px w-0 transition-all duration-300 group-hover:w-full'></span>
            </button>
            {isOpen && (
                <div className='animate-fade-in absolute top-full -left-4 mt-2 min-w-[260px] rounded-md border border-stone-200 bg-white shadow-lg'>
                    <div className='max-h-[80vh] overflow-y-auto py-2'>
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() =>
                                    handleLinkClick(link.label, link.href)
                                }
                                className='hover:text-gold-500 block px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50'
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

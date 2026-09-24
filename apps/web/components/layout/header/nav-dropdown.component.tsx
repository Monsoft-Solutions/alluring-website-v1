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
import type { NavDropdownProps } from './header.type'
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
                className='group relative flex items-center text-[0.8125rem] font-semibold tracking-[0.14em] text-stone-600 uppercase transition-colors hover:text-stone-950'
            >
                {label}
                <ChevronDown
                    className={`ml-1 h-3 w-3 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                />
                <span className='bg-gold-500 absolute -bottom-2 left-0 h-px w-0 transition-all duration-300 group-hover:w-full'></span>
            </button>
            {isOpen && (
                <div className='absolute top-full -left-4 pt-2'>
                    <div className='animate-fade-in min-w-[260px] rounded-xl border border-stone-200 bg-white shadow-[0_24px_48px_-24px_rgba(34,24,19,0.35)]'>
                        <div className='max-h-[80vh] overflow-y-auto py-2'>
                            {links.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() =>
                                        handleLinkClick(link.label, link.href)
                                    }
                                    className='block px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 hover:text-stone-950'
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

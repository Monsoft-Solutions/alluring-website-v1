/**
 * Mobile Menu Component
 *
 * Full-screen mobile menu overlay with accordion sections for dropdowns.
 * Uses CSS animations for performance (no Framer Motion).
 */
'use client'

import { useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@workspace/ui/components/button'
import { surgeons } from '@/lib/data/surgeons/surgeons-data'
import { procedures } from '@/lib/data/procedures.data'
import { getPhoneLink, contactInfo } from '@/lib/data/site-config'
import { useAnalyticsEvent } from '@/lib/analytics/useAnalyticsEvent.hook'

type MobileMenuProps = {
    isOpen: boolean
    onClose: () => void
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
    const [isProceduresMobileOpen, setIsProceduresMobileOpen] = useState(false)
    const [isSurgeonsMobileOpen, setIsSurgeonsMobileOpen] = useState(false)

    const { track } = useAnalyticsEvent()

    // Generate links dynamically
    const procedureLinks = procedures.map((procedure) => ({
        label: procedure.title,
        href: `/procedures/${procedure.slug}`,
    }))

    const surgeonLinks = surgeons.map((surgeon) => ({
        label: surgeon.name,
        href: `/${surgeon.slug}`,
    }))

    const handleSectionExpand = (sectionName: string, willOpen: boolean) => {
        if (willOpen) {
            track('nav_section_expand', {
                section_name: sectionName,
                nav_type: 'mobile',
            })
        }
    }

    const handleNavClick = (
        linkText: string,
        linkUrl: string,
        linkCategory: string
    ) => {
        track('nav_click', {
            link_text: linkText,
            link_url: linkUrl,
            nav_type: 'mobile',
            link_category: linkCategory,
        })
        onClose()
    }

    const handlePhoneClick = () => {
        track('nav_phone_click', {
            phone_number: contactInfo.phoneDisplay,
            nav_type: 'mobile',
        })
    }

    const handleCTAClick = () => {
        track('nav_cta_click', {
            cta_text: 'Request Consultation',
            nav_type: 'mobile',
        })
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className='animate-fade-in fixed inset-0 z-60 bg-white/95 backdrop-blur-xl'>
            {/* Mobile Menu Header */}
            <div className='container mx-auto flex h-20 items-center justify-between px-6 md:px-12'>
                <Link href='/' onClick={onClose} className='relative z-50'>
                    <Image
                        src='/logo-dark.png'
                        alt='Alluring Plastic Surgery'
                        width={140}
                        height={62}
                        className='h-10 w-auto md:h-12'
                    />
                </Link>
                <button
                    onClick={onClose}
                    className='group relative z-50 rounded-full bg-stone-100 p-3 text-stone-900 transition-colors hover:bg-stone-200'
                >
                    <X className='h-6 w-6 transition-transform duration-300 group-hover:rotate-90' />
                </button>
            </div>

            {/* Mobile Menu Content */}
            <div className='container mx-auto flex h-[calc(100vh-80px)] flex-col px-6 pb-10 md:px-12'>
                <div className='no-scrollbar flex-1 overflow-y-auto py-8'>
                    <div className='flex flex-col space-y-8'>
                        {/* Procedures Section */}
                        <div className='animate-fade-in-up w-full'>
                            <button
                                onClick={() => {
                                    const willOpen = !isProceduresMobileOpen
                                    handleSectionExpand('Procedures', willOpen)
                                    setIsProceduresMobileOpen(willOpen)
                                }}
                                className='group flex w-full items-center justify-between py-4 text-left'
                            >
                                <span className='font-serif text-3xl text-stone-900 transition-colors group-hover:text-stone-600 md:text-4xl'>
                                    Procedures
                                </span>
                                <span
                                    className={`flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 transition-all duration-300 ${isProceduresMobileOpen ? 'rotate-180 border-stone-900 bg-stone-900 text-white' : 'text-stone-400 group-hover:border-stone-400'}`}
                                >
                                    <ChevronDown className='h-5 w-5' />
                                </span>
                            </button>

                            {isProceduresMobileOpen && (
                                <div className='animate-accordion-down overflow-hidden'>
                                    <div className='ml-4 space-y-4 border-l border-stone-200 py-4 pl-6'>
                                        <div>
                                            <Link
                                                href='/procedures'
                                                onClick={() =>
                                                    handleNavClick(
                                                        'View All Procedures',
                                                        '/procedures',
                                                        'procedures'
                                                    )
                                                }
                                                className='text-gold-600 hover:text-gold-700 flex items-center gap-2 text-sm font-bold tracking-widest uppercase transition-colors'
                                            >
                                                View All Procedures
                                                <span className='text-lg'>
                                                    →
                                                </span>
                                            </Link>
                                        </div>

                                        <div className='grid grid-cols-1 gap-y-3 md:grid-cols-2 md:gap-x-8'>
                                            {procedureLinks.map((link) => (
                                                <div key={link.href}>
                                                    <Link
                                                        href={link.href}
                                                        onClick={() =>
                                                            handleNavClick(
                                                                link.label,
                                                                link.href,
                                                                'procedures'
                                                            )
                                                        }
                                                        className='block py-1 text-lg text-stone-600 transition-colors hover:text-stone-900'
                                                    >
                                                        {link.label}
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Surgeons Section */}
                        <div className='animate-fade-in-up animate-delay-100 w-full'>
                            <button
                                onClick={() => {
                                    const willOpen = !isSurgeonsMobileOpen
                                    handleSectionExpand('Surgeons', willOpen)
                                    setIsSurgeonsMobileOpen(willOpen)
                                }}
                                className='group flex w-full items-center justify-between py-4 text-left'
                            >
                                <span className='font-serif text-3xl text-stone-900 transition-colors group-hover:text-stone-600 md:text-4xl'>
                                    Surgeons
                                </span>
                                <span
                                    className={`flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 transition-all duration-300 ${isSurgeonsMobileOpen ? 'rotate-180 border-stone-900 bg-stone-900 text-white' : 'text-stone-400 group-hover:border-stone-400'}`}
                                >
                                    <ChevronDown className='h-5 w-5' />
                                </span>
                            </button>

                            {isSurgeonsMobileOpen && (
                                <div className='animate-accordion-down overflow-hidden'>
                                    <div className='ml-4 space-y-4 border-l border-stone-200 py-4 pl-6'>
                                        {surgeonLinks.map((link) => (
                                            <div key={link.href}>
                                                <Link
                                                    href={link.href}
                                                    onClick={() =>
                                                        handleNavClick(
                                                            link.label,
                                                            link.href,
                                                            'surgeons'
                                                        )
                                                    }
                                                    className='block py-1 text-lg text-stone-600 transition-colors hover:text-stone-900'
                                                >
                                                    {link.label}
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quiz Link - Featured */}
                        <div className='animate-fade-in-up animate-delay-200 w-full'>
                            <Link
                                href='/quiz'
                                onClick={() =>
                                    handleNavClick(
                                        'Find Your Procedure',
                                        '/quiz',
                                        'quiz'
                                    )
                                }
                                className='group flex w-full items-center py-4 text-left'
                            >
                                <span className='text-gold-600 group-hover:text-gold-700 font-serif text-3xl transition-colors md:text-4xl'>
                                    Find Your Procedure
                                </span>
                            </Link>
                        </div>

                        {/* Financing Link */}
                        <div className='animate-fade-in-up animate-delay-300 w-full'>
                            <Link
                                href='/plastic-surgery-financing-miami'
                                onClick={() =>
                                    handleNavClick(
                                        'Financing',
                                        '/plastic-surgery-financing-miami',
                                        'financing'
                                    )
                                }
                                className='group flex w-full items-center py-4 text-left'
                            >
                                <span className='font-serif text-3xl text-stone-900 transition-colors group-hover:text-stone-600 md:text-4xl'>
                                    Financing
                                </span>
                            </Link>
                        </div>

                        {/* Blog Link */}
                        <div className='animate-fade-in-up animate-delay-400 w-full'>
                            <Link
                                href='/blog'
                                onClick={() =>
                                    handleNavClick('Blog', '/blog', 'blog')
                                }
                                className='group flex w-full items-center py-4 text-left'
                            >
                                <span className='font-serif text-3xl text-stone-900 transition-colors group-hover:text-stone-600 md:text-4xl'>
                                    Blog
                                </span>
                            </Link>
                        </div>

                        {/* Gallery Link */}
                        <div className='animate-fade-in-up animate-delay-500 w-full'>
                            <Link
                                href='/gallery'
                                onClick={() =>
                                    handleNavClick(
                                        'Gallery',
                                        '/gallery',
                                        'gallery'
                                    )
                                }
                                className='group flex w-full items-center py-4 text-left'
                            >
                                <span className='font-serif text-3xl text-stone-900 transition-colors group-hover:text-stone-600 md:text-4xl'>
                                    Gallery
                                </span>
                            </Link>
                        </div>

                        {/* About Link */}
                        <div className='animate-fade-in-up animate-delay-600 w-full'>
                            <Link
                                href='/about'
                                onClick={() =>
                                    handleNavClick('About', '/about', 'about')
                                }
                                className='group flex w-full items-center py-4 text-left'
                            >
                                <span className='font-serif text-3xl text-stone-900 transition-colors group-hover:text-stone-600 md:text-4xl'>
                                    About
                                </span>
                            </Link>
                        </div>

                        {/* FAQ Link */}
                        <div className='animate-fade-in-up animate-delay-700 w-full'>
                            <Link
                                href='/faqs'
                                onClick={() =>
                                    handleNavClick('FAQ', '/faqs', 'faq')
                                }
                                className='group flex w-full items-center py-4 text-left'
                            >
                                <span className='font-serif text-3xl text-stone-900 transition-colors group-hover:text-stone-600 md:text-4xl'>
                                    FAQ
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Footer CTA */}
                <div className='animate-fade-in-up animate-delay-400 mt-auto border-t border-stone-100 pt-6'>
                    <div className='flex flex-col gap-4'>
                        <div className='flex justify-between text-sm font-medium text-stone-500'>
                            <span>
                                {contactInfo.city}, {contactInfo.state}
                            </span>
                            <Link
                                href={getPhoneLink()}
                                onClick={handlePhoneClick}
                                className='transition-colors hover:text-stone-900'
                            >
                                {contactInfo.phoneDisplay}
                            </Link>
                        </div>
                        <Button
                            size='lg'
                            className='h-14 w-full text-lg'
                            asChild
                        >
                            <Link href='/contact-us' onClick={handleCTAClick}>
                                Request Consultation
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

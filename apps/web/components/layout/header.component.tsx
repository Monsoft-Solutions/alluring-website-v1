/**
 * Header Component
 *
 * Main site header with responsive navigation.
 * Desktop navigation and mobile menu extracted to sub-components for maintainability.
 * Uses CSS animations for performance (no Framer Motion bundle weight).
 */
'use client'

import { useState, useEffect } from 'react'
import { Menu } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { DesktopNav } from './header/desktop-nav.component'
import { MobileMenu } from './header/mobile-menu.component'

export const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <>
            <header
                style={{
                    top: 'var(--announcement-bar-height, 0px)',
                }}
                className={`animate-slide-down fixed right-0 left-0 z-50 transition-all duration-500 ${
                    isScrolled
                        ? 'border-b border-stone-100 bg-white/80 py-4 backdrop-blur-md'
                        : 'bg-transparent py-6'
                }`}
            >
                <div className='mx-auto flex items-center justify-between px-6 md:px-8 lg:px-10 xl:px-12'>
                    {/* Logo */}
                    <Link
                        href='/'
                        className='group relative z-50 flex items-center'
                    >
                        <Image
                            src='/logo.png'
                            alt='Alluring Plastic Surgery'
                            width={150}
                            height={67}
                            className='h-10 w-auto transition-opacity group-hover:opacity-80 md:h-12 lg:h-14'
                            priority
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <DesktopNav />

                    {/* Mobile Toggle */}
                    <button
                        className='relative z-50 p-2 text-stone-900 lg:hidden'
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label='Toggle mobile menu'
                    >
                        <Menu className='h-6 w-6' />
                    </button>
                </div>
            </header>

            {/* Mobile Menu */}
            <MobileMenu
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />
        </>
    )
}

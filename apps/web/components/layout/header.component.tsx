'use client'

import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@workspace/ui/components/button'

export const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const { scrollY } = useScroll()

    // Header height shrinks slightly on scroll
    const headerPadding = useTransform(scrollY, [0, 100], ['1.5rem', '1rem'])

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const navLinks = [
        { label: 'Procedures', href: '#procedures' },
        { label: 'Gallery', href: '#gallery' },
        { label: 'Surgeons', href: '#surgeons' },
        { label: 'The Experience', href: '#experience' },
    ]

    return (
        <>
            <motion.header
                style={{
                    paddingTop: headerPadding,
                    paddingBottom: headerPadding,
                }}
                className={`fixed top-0 right-0 left-0 z-50 transition-colors duration-500 ${
                    isScrolled
                        ? 'border-b border-stone-100 bg-white/80 backdrop-blur-md'
                        : 'bg-transparent'
                }`}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className='container mx-auto flex items-center justify-between px-6 md:px-12'>
                    {/* Logo */}
                    <Link
                        href='/'
                        className='group relative z-50 flex flex-col items-start'
                    >
                        <span
                            className={`font-serif text-2xl font-medium tracking-tighter ${
                                isScrolled || isMobileMenuOpen
                                    ? 'text-stone-900'
                                    : 'text-stone-900'
                            }`}
                        >
                            ALLURING
                        </span>
                        <span className='text-gold-500 ml-0.5 text-[0.65rem] font-bold tracking-[0.3em] uppercase'>
                            Plastic Surgery
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className='hidden items-center space-x-10 lg:flex'>
                        {navLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className='hover:text-gold-500 group relative text-sm font-bold tracking-widest text-stone-500 uppercase transition-colors'
                            >
                                {link.label}
                                <span className='bg-gold-400 absolute -bottom-2 left-0 h-[1px] w-0 transition-all duration-300 group-hover:w-full'></span>
                            </a>
                        ))}
                    </nav>

                    {/* CTA Right */}
                    <div className='hidden items-center space-x-8 lg:flex'>
                        <a
                            href='tel:7863058649'
                            className='hover:text-gold-500 flex items-center text-sm font-bold tracking-widest text-stone-900 uppercase transition-colors'
                        >
                            (786) 305-8649
                        </a>
                        <Button size='sm' variant='primary'>
                            Request Consult
                        </Button>
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className='relative z-50 p-2 text-stone-900 lg:hidden'
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? (
                            <X className='h-6 w-6' />
                        ) : (
                            <Menu className='h-6 w-6' />
                        )}
                    </button>
                </div>
            </motion.header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            clipPath: 'circle(0% at 100% 0%)',
                        }}
                        animate={{
                            opacity: 1,
                            clipPath: 'circle(150% at 100% 0%)',
                        }}
                        exit={{
                            opacity: 0,
                            clipPath: 'circle(0% at 100% 0%)',
                        }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        className='fixed inset-0 z-40 flex items-center justify-center bg-stone-50'
                    >
                        <div className='container flex flex-col items-center justify-center space-y-8 px-6'>
                            {navLinks.map((link, idx) => (
                                <motion.a
                                    key={link.label}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + idx * 0.1 }}
                                    className='hover:text-gold-500 text-center font-serif text-4xl text-stone-900 transition-colors md:text-5xl'
                                >
                                    {link.label}
                                </motion.a>
                            ))}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className='flex w-full max-w-xs flex-col gap-4 pt-8'
                            >
                                <Button size='lg' className='w-full'>
                                    Book Consultation
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

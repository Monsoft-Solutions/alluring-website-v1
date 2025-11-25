'use client'

import { useState, useEffect } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@workspace/ui/components/button'
import { surgeons } from '@/lib/data/surgeons/surgeons-data'
import { procedures } from '@/lib/data/procedures.data'
import { getPhoneLink, contactInfo } from '@/lib/data/site-config'

export const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isSurgeonsDropdownOpen, setIsSurgeonsDropdownOpen] = useState(false)
    const [isProceduresDropdownOpen, setIsProceduresDropdownOpen] =
        useState(false)
    const [isSurgeonsMobileOpen, setIsSurgeonsMobileOpen] = useState(false)
    const [isProceduresMobileOpen, setIsProceduresMobileOpen] = useState(false)
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

    // Generate surgeon links dynamically
    const surgeonLinks = surgeons.map((surgeon) => ({
        label: surgeon.name,
        href: `/${surgeon.slug}`,
    }))

    // Generate procedure links dynamically
    const procedureLinks = procedures.map((procedure) => ({
        label: procedure.title,
        href: `/procedures/${procedure.slug}`,
    }))

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

                    {/* Desktop Nav */}
                    <nav className='hidden items-center space-x-10 lg:flex'>
                        {/* Procedures Dropdown */}
                        <div
                            className='group relative'
                            onMouseEnter={() =>
                                setIsProceduresDropdownOpen(true)
                            }
                            onMouseLeave={() =>
                                setIsProceduresDropdownOpen(false)
                            }
                        >
                            <button
                                onClick={() =>
                                    setIsProceduresDropdownOpen(
                                        !isProceduresDropdownOpen
                                    )
                                }
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault()
                                        setIsProceduresDropdownOpen(
                                            !isProceduresDropdownOpen
                                        )
                                    } else if (e.key === 'Escape') {
                                        setIsProceduresDropdownOpen(false)
                                    }
                                }}
                                aria-haspopup='true'
                                aria-expanded={isProceduresDropdownOpen}
                                className='hover:text-gold-500 group relative flex items-center text-sm font-bold tracking-widest text-stone-500 uppercase transition-colors'
                            >
                                Procedures
                                <ChevronDown
                                    className={`ml-1 h-3 w-3 transition-transform duration-200 ${
                                        isProceduresDropdownOpen
                                            ? 'rotate-180'
                                            : ''
                                    }`}
                                />
                                <span className='bg-gold-400 absolute -bottom-2 left-0 h-px w-0 transition-all duration-300 group-hover:w-full'></span>
                            </button>
                            <AnimatePresence>
                                {isProceduresDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className='absolute top-full -left-4 mt-2 min-w-[260px] rounded-md border border-stone-200 bg-white shadow-lg'
                                    >
                                        <div className='max-h-[80vh] overflow-y-auto py-2'>
                                            <Link
                                                href='/procedures'
                                                onClick={() =>
                                                    setIsProceduresDropdownOpen(
                                                        false
                                                    )
                                                }
                                                className='hover:text-gold-500 block border-b border-stone-200 px-4 py-2 text-sm font-bold text-stone-900 transition-colors hover:bg-stone-50'
                                            >
                                                View All Procedures
                                            </Link>
                                            {procedureLinks.map((link) => (
                                                <Link
                                                    key={link.href}
                                                    href={link.href}
                                                    onClick={() =>
                                                        setIsProceduresDropdownOpen(
                                                            false
                                                        )
                                                    }
                                                    className='hover:text-gold-500 block px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50'
                                                >
                                                    {link.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Surgeons Dropdown */}
                        <div
                            className='group relative'
                            onMouseEnter={() => setIsSurgeonsDropdownOpen(true)}
                            onMouseLeave={() =>
                                setIsSurgeonsDropdownOpen(false)
                            }
                        >
                            <button
                                onClick={() =>
                                    setIsSurgeonsDropdownOpen(
                                        !isSurgeonsDropdownOpen
                                    )
                                }
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault()
                                        setIsSurgeonsDropdownOpen(
                                            !isSurgeonsDropdownOpen
                                        )
                                    } else if (e.key === 'Escape') {
                                        setIsSurgeonsDropdownOpen(false)
                                    }
                                }}
                                aria-haspopup='true'
                                aria-expanded={isSurgeonsDropdownOpen}
                                className='hover:text-gold-500 group relative flex items-center text-sm font-bold tracking-widest text-stone-500 uppercase transition-colors'
                            >
                                Surgeons
                                <ChevronDown
                                    className={`ml-1 h-3 w-3 transition-transform duration-200 ${
                                        isSurgeonsDropdownOpen
                                            ? 'rotate-180'
                                            : ''
                                    }`}
                                />
                                <span className='bg-gold-400 absolute -bottom-2 left-0 h-px w-0 transition-all duration-300 group-hover:w-full'></span>
                            </button>
                            <AnimatePresence>
                                {isSurgeonsDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className='absolute top-full left-0 mt-2 min-w-[200px] rounded-md border border-stone-200 bg-white shadow-lg'
                                    >
                                        <div className='py-2'>
                                            {surgeonLinks.map((link) => (
                                                <Link
                                                    key={link.href}
                                                    href={link.href}
                                                    className='hover:text-gold-500 block px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50'
                                                >
                                                    {link.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
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

                    {/* Mobile Toggle */}
                    <button
                        className='relative z-50 p-2 text-stone-900 lg:hidden'
                        onClick={() => {
                            setIsMobileMenuOpen(!isMobileMenuOpen)
                            if (isMobileMenuOpen) {
                                setIsSurgeonsMobileOpen(false)
                                setIsProceduresMobileOpen(false)
                            }
                        }}
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
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className='fixed inset-0 z-[60] bg-white/95 backdrop-blur-xl'
                    >
                        {/* Mobile Menu Header */}
                        <div className='container mx-auto flex h-20 items-center justify-between px-6 md:px-12'>
                            <Link
                                href='/'
                                onClick={() => setIsMobileMenuOpen(false)}
                                className='relative z-50'
                            >
                                <Image
                                    src='/logo-dark.png'
                                    alt='Alluring Plastic Surgery'
                                    width={140}
                                    height={62}
                                    className='h-10 w-auto md:h-12'
                                />
                            </Link>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
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
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className='w-full'
                                    >
                                        <button
                                            onClick={() =>
                                                setIsProceduresMobileOpen(
                                                    !isProceduresMobileOpen
                                                )
                                            }
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

                                        <AnimatePresence>
                                            {isProceduresMobileOpen && (
                                                <motion.div
                                                    initial={{
                                                        opacity: 0,
                                                        height: 0,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        height: 'auto',
                                                    }}
                                                    exit={{
                                                        opacity: 0,
                                                        height: 0,
                                                    }}
                                                    transition={{
                                                        duration: 0.3,
                                                        ease: [0.16, 1, 0.3, 1],
                                                    }}
                                                    className='overflow-hidden'
                                                >
                                                    <div className='ml-4 space-y-4 border-l border-stone-200 py-4 pl-6'>
                                                        <motion.div
                                                            initial={{
                                                                opacity: 0,
                                                                x: -10,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                x: 0,
                                                            }}
                                                            transition={{
                                                                delay: 0.1,
                                                            }}
                                                        >
                                                            <Link
                                                                href='/procedures'
                                                                onClick={() =>
                                                                    setIsMobileMenuOpen(
                                                                        false
                                                                    )
                                                                }
                                                                className='text-gold-600 hover:text-gold-700 flex items-center gap-2 text-sm font-bold tracking-widest uppercase transition-colors'
                                                            >
                                                                View All
                                                                Procedures
                                                                <span className='text-lg'>
                                                                    →
                                                                </span>
                                                            </Link>
                                                        </motion.div>

                                                        <div className='grid grid-cols-1 gap-y-3 md:grid-cols-2 md:gap-x-8'>
                                                            {procedureLinks.map(
                                                                (link, idx) => (
                                                                    <motion.div
                                                                        key={
                                                                            link.href
                                                                        }
                                                                        initial={{
                                                                            opacity: 0,
                                                                            x: -10,
                                                                        }}
                                                                        animate={{
                                                                            opacity: 1,
                                                                            x: 0,
                                                                        }}
                                                                        transition={{
                                                                            delay:
                                                                                0.1 +
                                                                                idx *
                                                                                    0.02,
                                                                        }}
                                                                    >
                                                                        <Link
                                                                            href={
                                                                                link.href
                                                                            }
                                                                            onClick={() =>
                                                                                setIsMobileMenuOpen(
                                                                                    false
                                                                                )
                                                                            }
                                                                            className='block py-1 text-lg text-stone-600 transition-colors hover:text-stone-900'
                                                                        >
                                                                            {
                                                                                link.label
                                                                            }
                                                                        </Link>
                                                                    </motion.div>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>

                                    {/* Surgeons Section */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className='w-full'
                                    >
                                        <button
                                            onClick={() =>
                                                setIsSurgeonsMobileOpen(
                                                    !isSurgeonsMobileOpen
                                                )
                                            }
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

                                        <AnimatePresence>
                                            {isSurgeonsMobileOpen && (
                                                <motion.div
                                                    initial={{
                                                        opacity: 0,
                                                        height: 0,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        height: 'auto',
                                                    }}
                                                    exit={{
                                                        opacity: 0,
                                                        height: 0,
                                                    }}
                                                    transition={{
                                                        duration: 0.3,
                                                        ease: [0.16, 1, 0.3, 1],
                                                    }}
                                                    className='overflow-hidden'
                                                >
                                                    <div className='ml-4 space-y-4 border-l border-stone-200 py-4 pl-6'>
                                                        {surgeonLinks.map(
                                                            (link, idx) => (
                                                                <motion.div
                                                                    key={
                                                                        link.href
                                                                    }
                                                                    initial={{
                                                                        opacity: 0,
                                                                        x: -10,
                                                                    }}
                                                                    animate={{
                                                                        opacity: 1,
                                                                        x: 0,
                                                                    }}
                                                                    transition={{
                                                                        delay:
                                                                            0.1 +
                                                                            idx *
                                                                                0.05,
                                                                    }}
                                                                >
                                                                    <Link
                                                                        href={
                                                                            link.href
                                                                        }
                                                                        onClick={() =>
                                                                            setIsMobileMenuOpen(
                                                                                false
                                                                            )
                                                                        }
                                                                        className='block py-1 text-lg text-stone-600 transition-colors hover:text-stone-900'
                                                                    >
                                                                        {
                                                                            link.label
                                                                        }
                                                                    </Link>
                                                                </motion.div>
                                                            )
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                </div>
                            </div>

                            {/* Footer CTA */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className='mt-auto border-t border-stone-100 pt-6'
                            >
                                <div className='flex flex-col gap-4'>
                                    <div className='flex justify-between text-sm font-medium text-stone-500'>
                                        <span>
                                            {contactInfo.city},{' '}
                                            {contactInfo.state}
                                        </span>
                                        <Link
                                            href={getPhoneLink()}
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
                                        <Link href='/contact-us'>
                                            Request Consultation
                                        </Link>
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

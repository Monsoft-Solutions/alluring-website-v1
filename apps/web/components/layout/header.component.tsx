'use client'

import { useState, useEffect } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@workspace/ui/components/button'
import { surgeons } from '@/lib/data/surgeons/surgeons-data'
import { procedures } from '@/lib/data/procedures.data'

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

    const navLinks = [
        { label: 'Gallery', href: '#gallery' },
        { label: 'The Experience', href: '#experience' },
    ]

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
                                <span className='bg-gold-400 absolute -bottom-2 left-0 h-[1px] w-0 transition-all duration-300 group-hover:w-full'></span>
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

                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className='hover:text-gold-500 group relative text-sm font-bold tracking-widest text-stone-500 uppercase transition-colors'
                            >
                                {link.label}
                                <span className='bg-gold-400 absolute -bottom-2 left-0 h-[1px] w-0 transition-all duration-300 group-hover:w-full'></span>
                            </Link>
                        ))}
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
                                <span className='bg-gold-400 absolute -bottom-2 left-0 h-[1px] w-0 transition-all duration-300 group-hover:w-full'></span>
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
                            href='tel:7863058649'
                            className='hover:text-gold-500 flex items-center text-sm font-bold tracking-widest text-stone-900 uppercase transition-colors'
                        >
                            (786) 305-8649
                        </Link>
                        <Button size='sm' variant='primary'>
                            Request Consult
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
                            {/* Mobile Procedures Dropdown */}
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
                                    className='hover:text-gold-500 flex w-full items-center justify-center gap-2 text-center font-serif text-4xl text-stone-900 transition-colors md:text-5xl'
                                >
                                    Procedures
                                    <ChevronDown
                                        className={`h-6 w-6 transition-transform duration-200 ${
                                            isProceduresMobileOpen
                                                ? 'rotate-180'
                                                : ''
                                        }`}
                                    />
                                </button>
                                <AnimatePresence>
                                    {isProceduresMobileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{
                                                opacity: 1,
                                                height: 'auto',
                                            }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className='mt-4 space-y-4 overflow-hidden'
                                        >
                                            <motion.div
                                                initial={{
                                                    opacity: 0,
                                                    x: -20,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    x: 0,
                                                }}
                                                transition={{
                                                    delay: 0,
                                                }}
                                            >
                                                <Link
                                                    href='/procedures'
                                                    onClick={() => {
                                                        setIsMobileMenuOpen(
                                                            false
                                                        )
                                                        setIsProceduresMobileOpen(
                                                            false
                                                        )
                                                    }}
                                                    className='hover:text-gold-500 block text-center font-serif text-3xl font-bold text-stone-900 transition-colors md:text-4xl'
                                                >
                                                    View All Procedures
                                                </Link>
                                            </motion.div>
                                            {procedureLinks.map((link, idx) => (
                                                <motion.div
                                                    key={link.href}
                                                    initial={{
                                                        opacity: 0,
                                                        x: -20,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        x: 0,
                                                    }}
                                                    transition={{
                                                        delay: (idx + 1) * 0.05,
                                                    }}
                                                >
                                                    <Link
                                                        href={link.href}
                                                        onClick={() => {
                                                            setIsMobileMenuOpen(
                                                                false
                                                            )
                                                            setIsProceduresMobileOpen(
                                                                false
                                                            )
                                                        }}
                                                        className='hover:text-gold-500 block text-center font-serif text-3xl text-stone-700 transition-colors md:text-4xl'
                                                    >
                                                        {link.label}
                                                    </Link>
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            {navLinks.map((link, idx) => (
                                <motion.div
                                    key={link.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + idx * 0.1 }}
                                >
                                    <Link
                                        href={link.href}
                                        onClick={() =>
                                            setIsMobileMenuOpen(false)
                                        }
                                        className='hover:text-gold-500 text-center font-serif text-4xl text-stone-900 transition-colors md:text-5xl'
                                    >
                                        {link.label}
                                    </Link>
                                </motion.div>
                            ))}
                            {/* Mobile Surgeons Dropdown */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    delay: 0.2 + navLinks.length * 0.1,
                                }}
                                className='w-full'
                            >
                                <button
                                    onClick={() =>
                                        setIsSurgeonsMobileOpen(
                                            !isSurgeonsMobileOpen
                                        )
                                    }
                                    className='hover:text-gold-500 flex w-full items-center justify-center gap-2 text-center font-serif text-4xl text-stone-900 transition-colors md:text-5xl'
                                >
                                    Surgeons
                                    <ChevronDown
                                        className={`h-6 w-6 transition-transform duration-200 ${
                                            isSurgeonsMobileOpen
                                                ? 'rotate-180'
                                                : ''
                                        }`}
                                    />
                                </button>
                                <AnimatePresence>
                                    {isSurgeonsMobileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{
                                                opacity: 1,
                                                height: 'auto',
                                            }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className='mt-4 space-y-4 overflow-hidden'
                                        >
                                            {surgeonLinks.map((link, idx) => (
                                                <motion.div
                                                    key={link.href}
                                                    initial={{
                                                        opacity: 0,
                                                        x: -20,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        x: 0,
                                                    }}
                                                    transition={{
                                                        delay: idx * 0.05,
                                                    }}
                                                >
                                                    <Link
                                                        href={link.href}
                                                        onClick={() => {
                                                            setIsMobileMenuOpen(
                                                                false
                                                            )
                                                            setIsSurgeonsMobileOpen(
                                                                false
                                                            )
                                                        }}
                                                        className='hover:text-gold-500 block text-center font-serif text-3xl text-stone-700 transition-colors md:text-4xl'
                                                    >
                                                        {link.label}
                                                    </Link>
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
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

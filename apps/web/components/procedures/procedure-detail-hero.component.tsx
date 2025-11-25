'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { siteConfig } from '@/lib/data/site-config'
import { Button } from '@workspace/ui/components/button'
import { useRef } from 'react'

interface ProcedureDetailHeroProps {
    title: string
    subtitle?: string
    image?: string
}

export function ProcedureDetailHero({
    title,
    subtitle,
    image,
}: ProcedureDetailHeroProps) {
    const heroImage = image || '/images/procedures-hero-image.jpg' // Fallback
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end start'],
    })

    const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

    return (
        <div ref={containerRef} className='relative w-full'>
            {/* Sticky Background */}
            <div className='sticky top-0 h-screen w-full overflow-hidden'>
                <motion.div style={{ y }} className='relative h-full w-full'>
                    <Image
                        src={heroImage}
                        alt={title}
                        fill
                        className='object-cover'
                        priority
                        quality={90}
                    />
                    <div className='absolute inset-0 bg-gradient-to-b from-stone-900/30 via-stone-900/10 to-stone-900/80' />
                    <div className='absolute inset-0 bg-stone-900/20 backdrop-blur-[1px]' />
                </motion.div>
            </div>

            {/* Content Overlay */}
            <div className='relative z-10 -mt-[100vh] w-full md:flex md:h-screen md:flex-col md:justify-end'>
                {/* Mobile Spacer: 60vh pushes card down so only 40% (2/5) is visible initially */}
                <div className='h-[60vh] w-full shrink-0 md:hidden' />

                <div className='pointer-events-none container mx-auto px-4 pb-24 md:px-12 lg:pb-32'>
                    <div className='pointer-events-auto max-w-3xl md:ml-0'>
                        <motion.div
                            initial={{ opacity: 0, y: 120 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 1.4,
                                ease: [0.19, 1, 0.22, 1],
                            }}
                            className='relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md sm:p-10 md:p-14'
                        >
                            {/* Decorative elements */}
                            <div className='bg-gold-400/20 absolute top-0 right-0 -mt-24 -mr-24 h-80 w-80 rounded-full blur-3xl' />
                            <div className='absolute bottom-0 left-0 -mb-24 -ml-24 h-80 w-80 rounded-full bg-stone-500/20 blur-3xl' />

                            <div className='relative z-10'>
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4, duration: 0.8 }}
                                    className='mb-6 flex items-center gap-4'
                                >
                                    <span className='bg-gold-400 h-[1px] w-12 shadow-[0_0_10px_rgba(234,179,8,0.5)]'></span>
                                    <span className='text-gold-400 text-xs font-bold tracking-[0.3em] uppercase drop-shadow-sm'>
                                        Premium Procedure
                                    </span>
                                </motion.div>

                                <h1 className='font-serif text-4xl leading-[1.1] font-medium text-white drop-shadow-lg sm:text-5xl md:text-6xl lg:text-7xl'>
                                    {title}
                                </h1>

                                {subtitle && (
                                    <p className='mt-6 max-w-2xl text-lg leading-relaxed font-light text-stone-100 drop-shadow-md md:text-xl'>
                                        {subtitle}
                                    </p>
                                )}

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6, duration: 0.8 }}
                                    className='mt-10 flex flex-col gap-4 sm:flex-row'
                                >
                                    <Link href='/contact-us' passHref>
                                        <Button
                                            variant='gold'
                                            size='lg'
                                            withArrow
                                            className='w-full sm:w-auto'
                                        >
                                            Schedule Consultation
                                        </Button>
                                    </Link>
                                    <Link
                                        href={`tel:${siteConfig.contact.phone.replace(/\D/g, '')}`}
                                        passHref
                                    >
                                        <Button
                                            variant='outline'
                                            size='lg'
                                            className='w-full border-white text-white hover:border-white hover:bg-white hover:text-stone-900 sm:w-auto'
                                        >
                                            Call Us Now
                                        </Button>
                                    </Link>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    style={{ opacity }}
                    className='absolute bottom-12 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 text-white/80'
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <span className='text-xs font-bold tracking-[0.3em] uppercase drop-shadow-md'>
                        Scroll to Explore
                    </span>
                    <div className='flex h-10 w-[1px] overflow-hidden bg-white/20'>
                        <motion.div
                            className='h-1/2 w-full bg-white'
                            animate={{ y: ['-100%', '200%'] }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                        />
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

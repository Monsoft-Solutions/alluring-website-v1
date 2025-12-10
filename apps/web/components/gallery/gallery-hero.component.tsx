'use client'

import { motion } from 'framer-motion'
import { Button } from '@workspace/ui/components/button'
import { Camera, Images, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export function GalleryHero() {
    return (
        <section className='relative w-full'>
            {/* Sticky Background */}
            <div className='sticky top-0 z-0 h-screen w-full overflow-hidden'>
                {/* Gradient overlay for better text legibility */}
                <div className='pointer-events-none absolute inset-0 z-10 bg-linear-to-b from-stone-900/40 via-stone-900/20 to-stone-900/70' />
                <div className='pointer-events-none absolute inset-0 z-10 bg-stone-900/30 backdrop-blur-[2px]' />

                <Image
                    src='/images/procedures-hero-image.jpg'
                    alt='Gallery - Alluring Plastic Surgery Results'
                    fill
                    priority
                    className='scale-[1.15] object-cover'
                    sizes='100vw'
                    quality={90}
                />

                {/* Scroll Indicator */}
                <motion.div
                    className='absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-3 text-white/80 md:left-12 md:translate-x-0'
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <span className='text-xs font-bold tracking-[0.3em] uppercase drop-shadow-md'>
                        Explore Results
                    </span>
                    <div className='flex h-10 w-px overflow-hidden bg-white/20'>
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

            {/* Scrollable Content Wrapper */}
            <div className='relative z-10 -mt-[100vh] w-full'>
                {/* Mobile Spacer */}
                <div className='h-[85vh] w-full shrink-0 md:hidden' />

                {/* Desktop Spacer */}
                <div className='hidden h-[35vh] w-full shrink-0 md:block' />

                {/* Card Container */}
                <div className='pointer-events-none container mx-auto px-6 pb-24 md:px-12 lg:pb-32'>
                    {/* The Card */}
                    <div className='pointer-events-auto md:w-[80%] lg:w-[55%]'>
                        <motion.div
                            initial={{ opacity: 0, y: 120 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 1.4,
                                ease: [0.19, 1, 0.22, 1],
                            }}
                            className='relative overflow-hidden border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md md:p-16'
                        >
                            {/* Decorative blur orbs */}
                            <div className='bg-gold-400/20 absolute top-0 right-0 -mt-24 -mr-24 h-80 w-80 rounded-full blur-3xl' />
                            <div className='absolute bottom-0 left-0 -mb-24 -ml-24 h-80 w-80 rounded-full bg-stone-500/20 blur-3xl' />

                            <div className='relative z-10'>
                                {/* Tagline with staggered animation */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4, duration: 0.8 }}
                                    className='mb-6 flex items-center gap-4'
                                >
                                    <span className='bg-gold-400 h-px w-12 shadow-[0_0_10px_rgba(234,179,8,0.5)]'></span>
                                    <span className='text-gold-400 text-xs font-bold tracking-[0.3em] uppercase drop-shadow-sm'>
                                        Real Results Gallery
                                    </span>
                                </motion.div>

                                {/* Title */}
                                <h1 className='mb-8 font-serif text-5xl leading-[1.05] font-medium text-white drop-shadow-lg md:text-6xl lg:text-7xl'>
                                    <span className='text-white'>
                                        Transformations
                                    </span>
                                    <br />
                                    <span className='font-light text-stone-200 italic'>
                                        That Inspire.
                                    </span>
                                </h1>

                                {/* Description */}
                                <p className='mb-10 max-w-lg text-xl leading-relaxed font-light text-stone-200 drop-shadow-md'>
                                    Discover the artistry of our board-certified
                                    surgeons through authentic before and after
                                    results. Every transformation tells a story
                                    of renewed confidence.
                                </p>

                                {/* CTAs with staggered animation */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6, duration: 0.8 }}
                                    className='mb-10 flex flex-col gap-4 sm:flex-row'
                                >
                                    <Button
                                        asChild
                                        variant='gold'
                                        size='lg'
                                        withArrow
                                        className='w-full sm:w-auto'
                                    >
                                        <Link href='#gallery-showcase'>
                                            View Before &amp; After
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        variant='outline'
                                        size='lg'
                                        className='w-full border-white text-white hover:border-white hover:bg-white hover:text-stone-900 sm:w-auto'
                                    >
                                        <Link href='/contact-us'>
                                            Book Consultation
                                        </Link>
                                    </Button>
                                </motion.div>

                                {/* Trust Signals */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8, duration: 0.8 }}
                                    className='flex flex-wrap items-center gap-6 border-t border-white/10 pt-8 text-xs font-bold tracking-widest text-stone-300 uppercase md:gap-8'
                                >
                                    <div className='flex items-center gap-2'>
                                        <Camera className='text-gold-400 h-5 w-5' />
                                        <span>Real Patient Photos</span>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <Star className='text-gold-400 h-5 w-5' />
                                        <span>Verified Results</span>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <Images className='text-gold-400 h-5 w-5' />
                                        <span>Multiple Angles</span>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    )
}

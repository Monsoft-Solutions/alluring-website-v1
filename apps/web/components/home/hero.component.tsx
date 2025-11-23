'use client'

import { motion } from 'framer-motion'
import { Button } from './button.component'
import { ShieldCheck, Star } from 'lucide-react'

export const Hero = () => {
    return (
        <section className='relative w-full'>
            {/* Sticky Video Background */}
            <div className='sticky top-0 z-0 h-screen w-full overflow-hidden'>
                <div className='pointer-events-none absolute inset-0 z-10 bg-stone-900/20' />

                {/* Desktop Video - Visible on md (tablet) and up */}
                <video
                    src='https://sarpxxbehh1ep7ka.public.blob.vercel-storage.com/videos/alluring-home-hero-v1-desktop.mp4'
                    className='pointer-events-none hidden h-full w-full scale-[1.15] object-cover md:block'
                    autoPlay
                    muted
                    loop
                    playsInline
                    aria-label='Hero Video Desktop'
                />

                {/* Mobile Video (Vertical) - Hidden on md and up */}
                <video
                    src='https://sarpxxbehh1ep7ka.public.blob.vercel-storage.com/videos/alluring-home-hero-v1-mobile.mp4'
                    className='pointer-events-none h-full w-full scale-[1.15] object-cover md:hidden'
                    autoPlay
                    muted
                    loop
                    playsInline
                    aria-label='Hero Video Mobile'
                />

                {/* Scroll Indicator */}
                <motion.div
                    className='absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-white/80 md:left-12 md:translate-x-0'
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <span className='text-xs tracking-widest uppercase shadow-black/50 drop-shadow-md'>
                        Scroll
                    </span>
                    <div className='h-12 w-[1px] bg-white/50 shadow-black/50 drop-shadow-md'></div>
                </motion.div>
            </div>

            {/* Scrollable Content Wrapper */}
            <div className='relative z-10 -mt-[100vh] w-full'>
                {/* Mobile Spacer: 85vh pushes card down so only the top 15% is visible initially */}
                <div className='h-[85vh] w-full shrink-0 md:hidden' />

                {/* Desktop Spacer: 35vh pushes card down to give the video 'more space' initially */}
                <div className='hidden h-[35vh] w-full shrink-0 md:block' />

                {/* The Card Container */}
                <div className='pointer-events-none container mx-auto px-6 pb-24 md:px-12 lg:pb-32'>
                    {/* The Card */}
                    <div className='pointer-events-auto md:w-[80%] lg:w-[55%]'>
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className='relative border border-white/50 bg-white/80 p-8 shadow-2xl backdrop-blur-xl md:p-16 lg:bg-white/60'
                        >
                            {/* Decorative Line */}
                            <div className='absolute top-0 left-8 h-16 w-[1px] bg-stone-900/20 md:left-16'></div>

                            <div className='mb-8 flex items-center gap-3'>
                                <span className='bg-gold-400 h-[1px] w-8'></span>
                                <span className='text-gold-500 text-sm font-bold tracking-[0.2em] uppercase'>
                                    Miami • Board-Certified
                                </span>
                            </div>

                            <h1 className='mb-8 font-serif text-5xl leading-[1.05] md:text-6xl xl:text-7xl'>
                                <span className='text-stone-900'>
                                    Luxury Results,
                                </span>
                                <br />
                                <span className='font-light text-stone-600 italic'>
                                    Designed for You.
                                </span>
                            </h1>

                            <p className='mb-10 max-w-lg text-xl leading-relaxed font-light text-stone-600'>
                                You bring the vision — our surgeons bring years
                                of board-certified expertise and a concierge
                                experience that feels as elevated as your
                                results.
                            </p>

                            <div className='mb-10 flex flex-col gap-5 sm:flex-row'>
                                <Button size='md' withArrow>
                                    Start Consultation
                                </Button>
                                <Button size='md' variant='outline'>
                                    Call (786) 305-8649
                                </Button>
                            </div>

                            <div className='flex items-center gap-8 border-t border-stone-200 pt-8 text-sm font-bold tracking-widest text-stone-400 uppercase'>
                                <div className='flex items-center gap-2'>
                                    <ShieldCheck className='text-gold-500 h-5 w-5' />
                                    <span>Accredited Facility</span>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <Star className='text-gold-500 h-5 w-5' />
                                    <span>5-Star Reviews</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    )
}

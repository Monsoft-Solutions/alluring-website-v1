'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@workspace/ui/components/button'
import { ArrowRight, ShieldCheck, Star } from 'lucide-react'
import { getPhoneLink, siteConfig } from '@/lib/data/site-config'
import { useAnalyticsEvent } from '@/lib/analytics/useAnalyticsEvent.hook'

export const Hero = () => {
    const { track } = useAnalyticsEvent()

    const handlePrimaryCTAClick = () => {
        track('cta_click', {
            cta_name: 'hero_primary',
            cta_text: 'Start Consultation',
            page_section: 'hero',
        })
    }

    const handlePhoneClick = () => {
        track('phone_click', {
            cta_name: 'hero_secondary',
            phone_number: siteConfig.contact.phoneDisplay,
            page_section: 'hero',
        })
    }

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
                    src='https://izzyzxqzbsra7zcm.public.blob.vercel-storage.com/alluring-plastic-surgery-hero-video-xPlfL5OnXHOkkxm3wd37DbzjnNDYlM.mp4'
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

                            <h1
                                className='mb-8 font-serif text-5xl leading-[1.05] md:text-6xl xl:text-7xl'
                                data-speakable='true'
                            >
                                <span className='text-stone-900'>
                                    Miami&apos;s Premier Plastic Surgery.
                                </span>
                                <br />
                                <span className='font-light text-stone-600 italic'>
                                    Luxury Results, Designed for You.
                                </span>
                            </h1>

                            <p
                                className='mb-10 max-w-lg text-xl leading-relaxed font-light text-stone-600'
                                data-speakable='true'
                            >
                                BBL, breast augmentation, mommy makeover,
                                liposuction—tailored to your unique goals by
                                double board-certified surgeons with a concierge
                                experience as elevated as your results.
                            </p>

                            <div className='mb-10 flex flex-col gap-5 sm:flex-row'>
                                <Button size='md' asChild>
                                    <Link
                                        href='/contact-us'
                                        onClick={handlePrimaryCTAClick}
                                        aria-label='Start your consultation - Navigate to contact page'
                                        className='group'
                                    >
                                        <span className='flex items-center'>
                                            Start Consultation
                                            <ArrowRight className='ml-3 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1' />
                                        </span>
                                    </Link>
                                </Button>
                                <Button size='md' variant='outline' asChild>
                                    <a
                                        href={getPhoneLink()}
                                        onClick={handlePhoneClick}
                                        aria-label={`Call us at ${siteConfig.contact.phoneDisplay}`}
                                    >
                                        Call (786) 305-8649
                                    </a>
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

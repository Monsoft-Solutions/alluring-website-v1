/**
 * About Hero Fullbleed Component
 *
 * Full-screen hero section with background image and glassmorphism content card.
 * Uses sticky background pattern similar to home page hero for better mobile experience.
 */

import Image from 'next/image'
import { ShieldCheck, Award, Star, Users } from 'lucide-react'

export function AboutHeroFullbleed() {
    return (
        <section className='relative w-full'>
            {/* Sticky Image Background */}
            <div className='sticky top-0 z-0 h-screen w-full overflow-hidden'>
                <div className='pointer-events-none absolute inset-0 z-10 bg-stone-900/30' />
                <Image
                    src='/images/hero-beautiful-latin-woman.jpg'
                    alt='Alluring Plastic Surgery - Beautiful Results'
                    fill
                    className='pointer-events-none object-cover'
                    priority
                    sizes='100vw'
                />

                {/* Scroll Indicator */}
                <div className='absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 animate-bounce flex-col items-center gap-2 text-white/80 md:left-12 md:translate-x-0'>
                    <span className='text-xs tracking-widest uppercase shadow-black/50 drop-shadow-md'>
                        Scroll
                    </span>
                    <div className='h-12 w-px bg-white/50 shadow-black/50 drop-shadow-md'></div>
                </div>
            </div>

            {/* Scrollable Content Wrapper */}
            <div className='relative z-10 -mt-[100vh] w-full'>
                {/* Mobile Spacer: 85vh pushes card down so only the top 15% is visible initially */}
                <div className='h-[85vh] w-full shrink-0 md:hidden' />

                {/* Desktop Spacer: 35vh pushes card down to give the image 'more space' initially */}
                <div className='hidden h-[35vh] w-full shrink-0 md:block' />

                {/* The Card Container */}
                <div className='pointer-events-none container mx-auto px-6 pb-24 md:px-12 lg:pb-32'>
                    {/* The Card */}
                    <div className='pointer-events-auto md:w-[80%] lg:w-[55%]'>
                        <div className='animate-fade-in-up relative border border-white/50 bg-white/80 p-8 shadow-2xl backdrop-blur-xl md:p-16 lg:bg-white/60'>
                            {/* Decorative Line */}
                            <div className='absolute top-0 left-8 h-16 w-px bg-stone-900/20 md:left-16'></div>

                            {/* Section Label */}
                            <div className='mb-8 flex items-center gap-3'>
                                <span className='bg-gold-400 h-px w-8'></span>
                                <span className='text-gold-500 text-sm font-bold tracking-[0.2em] uppercase'>
                                    Excellence in Aesthetic Surgery
                                </span>
                            </div>

                            {/* Heading */}
                            <h1 className='mb-8 font-serif text-5xl leading-[1.05] md:text-6xl xl:text-7xl'>
                                <span className='text-stone-900'>
                                    Where Art Meets
                                </span>
                                <br />
                                <span className='font-light text-stone-600 italic'>
                                    Precision.
                                </span>
                            </h1>

                            {/* Description */}
                            <p className='mb-10 max-w-lg text-xl leading-relaxed font-light text-stone-600'>
                                Alluring Plastic Surgery combines world-class
                                surgical expertise with a luxury concierge
                                experience. Double Board-Certified surgeons,
                                state-of-the-art facility, and a promise that
                                defines us:{' '}
                                <strong className='font-bold text-stone-900'>
                                    Luxury Surgeries Made Affordable
                                </strong>
                                .
                            </p>

                            {/* Trust Badges */}
                            <div className='grid grid-cols-2 gap-4 border-t border-stone-200 pt-8 md:grid-cols-4'>
                                <div className='flex items-center gap-2'>
                                    <ShieldCheck className='text-gold-500 h-6 w-6 shrink-0' />
                                    <div>
                                        <div className='text-sm font-bold text-stone-900'>
                                            Double
                                        </div>
                                        <div className='text-xs text-stone-500'>
                                            Board-Certified
                                        </div>
                                    </div>
                                </div>

                                <div className='flex items-center gap-2'>
                                    <Award className='text-gold-500 h-6 w-6 shrink-0' />
                                    <div>
                                        <div className='text-sm font-bold text-stone-900'>
                                            Board Certified
                                        </div>
                                        <div className='text-xs text-stone-500'>
                                            Surgeons
                                        </div>
                                    </div>
                                </div>

                                <div className='flex items-center gap-2'>
                                    <Users className='text-gold-500 h-6 w-6 shrink-0' />
                                    <div>
                                        <div className='text-sm font-bold text-stone-900'>
                                            5,000+
                                        </div>
                                        <div className='text-xs text-stone-500'>
                                            Patients
                                        </div>
                                    </div>
                                </div>

                                <div className='flex items-center gap-2'>
                                    <Star className='text-gold-500 h-6 w-6 shrink-0' />
                                    <div>
                                        <div className='text-sm font-bold text-stone-900'>
                                            4.9 Stars
                                        </div>
                                        <div className='text-xs text-stone-500'>
                                            Rating
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

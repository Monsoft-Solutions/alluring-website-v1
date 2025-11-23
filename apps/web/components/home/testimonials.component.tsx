'use client'

import { Star, Quote } from 'lucide-react'
import { motion } from 'framer-motion'
import Image from 'next/image'

export const Testimonials = () => {
    return (
        <section className='overflow-hidden bg-white py-32'>
            <div className='container mx-auto px-6 md:px-12'>
                <div className='grid gap-20 lg:grid-cols-2'>
                    <div className='flex flex-col justify-center'>
                        <Quote className='text-gold-200 mb-8 h-16 w-16 fill-current' />
                        <h2 className='mb-8 font-serif text-4xl leading-tight text-stone-900 md:text-5xl'>
                            "I wish I had <br /> done this sooner."
                        </h2>
                        <p className='mb-8 max-w-md text-lg leading-relaxed text-stone-500'>
                            See why hundreds of patients rate Alluring Plastic
                            Surgery 5 stars on Google and RealSelf.
                        </p>
                        <div className='flex items-center gap-4'>
                            <div className='flex -space-x-2'>
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className='relative h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-stone-200'
                                    >
                                        <Image
                                            src={`https://i.pravatar.cc/100?img=${i + 10}`}
                                            alt='User'
                                            fill
                                            className='object-cover'
                                            sizes='40px'
                                        />
                                    </div>
                                ))}
                            </div>
                            <span className='border-b border-stone-300 pb-1 text-sm font-bold tracking-widest text-stone-900 uppercase'>
                                Read 500+ Reviews
                            </span>
                        </div>
                    </div>

                    <div className='relative'>
                        <div className='absolute inset-0 z-10 bg-gradient-to-r from-white via-transparent to-transparent lg:hidden'></div>
                        <div className='scrollbar-hide flex snap-x gap-6 overflow-x-auto pb-8'>
                            {/* Card 1 */}
                            <motion.div
                                className='min-w-[300px] snap-center border border-stone-100 bg-stone-50 p-8 md:min-w-[350px] md:p-10'
                                whileHover={{ y: -5 }}
                            >
                                <div className='text-gold-400 mb-6 flex gap-1'>
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className='h-4 w-4 fill-current'
                                        />
                                    ))}
                                </div>
                                <p className='mb-6 font-serif text-xl leading-relaxed text-stone-700 italic'>
                                    "From my first call, I never felt rushed or
                                    pushed. They explained every option, every
                                    risk. Three months post-surgery, I finally
                                    feel like my body matches the way I see
                                    myself."
                                </p>
                                <div>
                                    <span className='mb-1 block text-sm font-bold tracking-widest text-stone-900 uppercase'>
                                        Jennifer S.
                                    </span>
                                    <span className='text-sm text-stone-400'>
                                        Mommy Makeover
                                    </span>
                                </div>
                            </motion.div>

                            {/* Card 2 */}
                            <motion.div
                                className='min-w-[300px] snap-center border border-stone-100 bg-stone-50 p-8 md:min-w-[350px] md:p-10'
                                whileHover={{ y: -5 }}
                            >
                                <div className='text-gold-400 mb-6 flex gap-1'>
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className='h-4 w-4 fill-current'
                                        />
                                    ))}
                                </div>
                                <p className='mb-6 font-serif text-xl leading-relaxed text-stone-700 italic'>
                                    "My BBL looks natural, not exaggerated. The
                                    team checked on me constantly after surgery
                                    and answered every late-night question I
                                    had."
                                </p>
                                <div>
                                    <span className='mb-1 block text-sm font-bold tracking-widest text-stone-900 uppercase'>
                                        Maria G.
                                    </span>
                                    <span className='text-sm text-stone-400'>
                                        BBL Patient
                                    </span>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

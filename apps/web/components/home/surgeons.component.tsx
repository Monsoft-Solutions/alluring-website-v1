'use client'

import { SectionContainer } from '../shared/section-container.component'
import { ContentWrapper } from '../shared/content-wrapper.component'
import { motion } from 'framer-motion'
import { Button } from './button.component'
import Image from 'next/image'

export const Surgeons = () => {
    return (
        <SectionContainer
            id='surgeons'
            variant='default'
            className='relative overflow-hidden bg-stone-900 text-white'
            paddingY='py-32'
        >
            <ContentWrapper
                size='lg'
                paddingX='px-6 md:px-12'
                className='relative z-10'
            >
                <div className='flex flex-col items-center gap-16 lg:flex-row lg:items-stretch'>
                    {/* Image Stack */}
                    <div className='relative flex min-h-[400px] w-full justify-center lg:block lg:w-1/2'>
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className='relative aspect-[3/4] w-full max-w-md'
                        >
                            <Image
                                src='https://www.alluringplasticsurgery.com/wp-content/uploads/2024/09/dr-karlinsky-featured-image.webp'
                                alt='Dr. Victoria Karlinsky'
                                fill
                                className='object-cover grayscale transition-all duration-700 ease-in-out hover:grayscale-0'
                                sizes='(max-width: 1024px) 100vw, 50vw'
                            />
                            {/* Floating Box */}
                            <div className='bg-gold-500/10 border-gold-500/30 absolute -right-8 -bottom-8 hidden h-48 w-48 border backdrop-blur-md md:block'></div>
                        </motion.div>
                    </div>

                    {/* Content */}
                    <div className='flex flex-col justify-center lg:w-1/2'>
                        <div className='mb-8'>
                            <span className='text-gold-500 mb-2 block text-sm font-bold tracking-widest uppercase'>
                                World Class Talent
                            </span>
                            <h2 className='mb-8 font-serif text-4xl leading-none md:text-6xl'>
                                Meet the <br />
                                <span className='text-stone-500'>Masters.</span>
                            </h2>
                        </div>

                        <div className='mb-12 space-y-8 border-l border-stone-800 pl-8'>
                            <p className='font-serif text-2xl leading-relaxed text-stone-300 italic'>
                                &quot;Cosmetic surgery is never just about a
                                single feature. It&apos;s about how you feel
                                when you walk into a room — and knowing we
                                prioritized your safety at every step.&quot;
                            </p>
                            <div className='flex flex-col gap-2'>
                                <span className='text-base font-bold tracking-wider text-white uppercase'>
                                    Dr. Victoria Karlinsky
                                </span>
                                <span className='text-base text-stone-500'>
                                    Board Certified Cosmetic Surgeon
                                </span>
                            </div>
                        </div>

                        <div className='flex flex-wrap gap-4'>
                            <Button variant='gold' size='md'>
                                Meet The Team
                            </Button>
                            <Button
                                variant='outline'
                                className='border-stone-700 text-white hover:border-white hover:text-white'
                            >
                                Verify Credentials
                            </Button>
                        </div>
                    </div>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}

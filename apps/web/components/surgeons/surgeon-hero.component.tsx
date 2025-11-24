'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'
import { Button } from '@workspace/ui/components/button'
import { Surgeon } from '@/lib/types/surgeon.type'
import { getPhoneLink } from '@/lib/data/site-config'

interface SurgeonHeroProps {
    surgeon: Surgeon
}

export const SurgeonHero = ({ surgeon }: SurgeonHeroProps) => {
    const containerRef = useRef<HTMLElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end start'],
    })

    const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
    const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

    const textVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1 + 0.3,
                duration: 0.8,
                ease: [0.215, 0.61, 0.355, 1] as const,
            },
        }),
    }

    return (
        <section
            ref={containerRef}
            className='relative min-h-screen w-full overflow-hidden bg-stone-950 text-white'
        >
            {/* Background Texture */}
            <div className='absolute inset-0 z-0 opacity-20'>
                <div className='absolute inset-0 opacity-30 mix-blend-overlay' />
            </div>

            <div className='relative z-10 container mx-auto flex h-full min-h-screen flex-col-reverse items-center px-6 pt-32 pb-16 lg:flex-row lg:justify-between lg:pt-0 lg:pb-0'>
                {/* Text Content */}
                <div className='mt-12 flex flex-col items-center text-center lg:mt-0 lg:w-1/2 lg:items-start lg:text-left'>
                    <motion.div
                        custom={0}
                        initial='hidden'
                        animate='visible'
                        variants={textVariants}
                    >
                        <span className='text-gold-400 mb-6 block text-sm font-bold tracking-[0.2em] uppercase'>
                            {surgeon.role}
                        </span>
                    </motion.div>

                    <div className='mb-8 overflow-hidden'>
                        <motion.h1
                            custom={1}
                            initial='hidden'
                            animate='visible'
                            variants={textVariants}
                            className='font-serif text-5xl leading-none md:text-7xl lg:text-8xl'
                        >
                            {surgeon.name.split(' ').map((word, i) => (
                                <span key={i} className='mr-4 inline-block'>
                                    {word}
                                </span>
                            ))}
                        </motion.h1>
                    </div>

                    <motion.p
                        custom={2}
                        initial='hidden'
                        animate='visible'
                        variants={textVariants}
                        className='mb-10 max-w-xl text-lg leading-relaxed text-stone-300 lg:text-xl'
                    >
                        {surgeon.title}
                    </motion.p>

                    {surgeon.quote && (
                        <motion.div
                            custom={3}
                            initial='hidden'
                            animate='visible'
                            variants={textVariants}
                            className='border-gold-500/50 mb-12 border-l-2 pl-8 text-lg font-light text-stone-400 italic'
                        >
                            &quot;{surgeon.quote}&quot;
                        </motion.div>
                    )}

                    <motion.div
                        custom={4}
                        initial='hidden'
                        animate='visible'
                        variants={textVariants}
                        className='flex flex-col gap-5 sm:flex-row'
                    >
                        <Button variant='gold' size='lg' withArrow>
                            Book Consultation
                        </Button>
                        <Button
                            variant='outline'
                            className='border-stone-700 text-white hover:border-white hover:text-white'
                            size='lg'
                            asChild
                        >
                            <Link href={getPhoneLink()}>Call Now</Link>
                        </Button>
                    </motion.div>
                </div>

                {/* Image with Parallax */}
                <div className='relative mt-12 h-[50vh] w-full max-w-lg lg:absolute lg:top-0 lg:right-0 lg:mt-0 lg:h-screen lg:w-1/2'>
                    <div className='absolute inset-0 z-10 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent lg:bg-gradient-to-r lg:from-stone-950 lg:via-stone-950/20 lg:to-transparent' />
                    <motion.div
                        style={{ y, opacity }}
                        className='relative h-full w-full'
                    >
                        <Image
                            src={surgeon.images.featured}
                            alt={surgeon.name}
                            fill
                            className='object-cover object-top'
                            priority
                            sizes='(max-width: 768px) 100vw, 50vw'
                        />
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

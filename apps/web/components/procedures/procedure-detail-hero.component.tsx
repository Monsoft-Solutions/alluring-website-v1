'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { ContainerLayout } from '@/components/container-layout.component'
import { siteConfig } from '@/lib/data/site-config'

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

    return (
        <section className='relative h-[90vh] w-full overflow-hidden bg-stone-900'>
            {/* Background Image */}
            <div className='absolute inset-0 z-0'>
                <Image
                    src={heroImage}
                    alt={title}
                    fill
                    className='object-cover opacity-60'
                    priority
                    quality={90}
                />
                <div className='absolute inset-0 bg-gradient-to-b from-stone-900/50 via-stone-900/20 to-stone-900/90' />
            </div>

            {/* Content */}
            <div className='relative z-10 flex h-full flex-col justify-center pt-20'>
                <ContainerLayout>
                    <div className='max-w-4xl'>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                        >
                            <div className='mb-6 flex items-center gap-3'>
                                <span className='bg-gold-400 h-[1px] w-12'></span>
                                <span className='text-gold-500 text-sm font-bold tracking-[0.2em] uppercase'>
                                    Premium Procedure
                                </span>
                            </div>
                            <h1 className='mb-6 font-serif text-5xl leading-tight text-white sm:text-6xl md:text-7xl'>
                                {title}
                            </h1>
                            {subtitle && (
                                <p className='mb-10 max-w-2xl text-xl leading-relaxed font-light text-stone-200'>
                                    {subtitle}
                                </p>
                            )}

                            <div className='flex flex-col gap-4 sm:flex-row'>
                                <Link
                                    href='/contact'
                                    className='bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-12 items-center justify-center rounded-lg px-8 text-base font-semibold transition-all'
                                >
                                    Schedule Consultation
                                    <ArrowRight className='ml-2 h-4 w-4' />
                                </Link>
                                <Link
                                    href={`tel:${siteConfig.contact.phone.replace(/\D/g, '')}`}
                                    className='inline-flex h-12 items-center justify-center rounded-lg border border-white/30 px-8 text-base font-medium text-white transition-all hover:bg-white/10'
                                >
                                    Call Us Now
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </ContainerLayout>

                {/* Scroll Indicator */}
                <motion.div
                    className='absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-white/60'
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <span className='text-xs font-medium tracking-widest uppercase'>
                        Scroll
                    </span>
                    <ArrowDown className='h-4 w-4' />
                </motion.div>
            </div>
        </section>
    )
}

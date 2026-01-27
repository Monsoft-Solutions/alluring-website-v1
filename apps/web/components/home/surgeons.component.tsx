'use client'

import { SectionContainer } from '../shared/section-container.component'
import { ContentWrapper } from '../shared/content-wrapper.component'
import { motion } from 'framer-motion'
import { Button } from '@workspace/ui/components/button'
import Image from 'next/image'
import Link from 'next/link'
import {
    Award,
    BadgeCheck,
    ExternalLink,
    Sparkles,
    TrendingUp,
} from 'lucide-react'

/**
 * Credential stat type
 */
type CredentialStat = {
    readonly icon: React.ReactNode
    readonly value: string
    readonly label: string
}

export const Surgeons = () => {
    const credentialStats: CredentialStat[] = [
        {
            icon: <Sparkles className='h-4 w-4' />,
            value: '1,500+',
            label: 'BBL Procedures',
        },
        {
            icon: <TrendingUp className='h-4 w-4' />,
            value: '5,000+',
            label: 'Total Surgeries',
        },
        {
            icon: <Award className='h-4 w-4' />,
            value: '15+',
            label: 'Years Experience',
        },
    ]

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
                                src='/images/surgeons/dr-karlinsky.webp'
                                alt='Dr. Victoria Karlinsky - Double Board-Certified Cosmetic Surgeon specializing in BBL, breast augmentation, and mommy makeover at Alluring Plastic Surgery Miami'
                                fill
                                className='object-cover grayscale transition-all duration-700 ease-in-out hover:grayscale-0'
                                sizes='(max-width: 1024px) 100vw, 50vw'
                            />
                            {/* Floating Box */}
                            <div className='bg-gold-500/10 border-gold-500/30 absolute -right-8 -bottom-8 hidden h-48 w-48 border backdrop-blur-md md:block'></div>

                            {/* Credential Stats Overlay */}
                            <div className='absolute right-4 -bottom-4 left-4 flex gap-2 md:right-auto md:-bottom-12 md:left-0 md:gap-3'>
                                {credentialStats.map((stat, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className='flex flex-1 flex-col items-center gap-1 border border-stone-700 bg-stone-900/95 p-3 backdrop-blur-sm md:p-4'
                                    >
                                        <div className='text-gold-400'>
                                            {stat.icon}
                                        </div>
                                        <span className='text-lg font-bold text-white md:text-xl'>
                                            {stat.value}
                                        </span>
                                        <span className='text-center text-[10px] text-stone-400 uppercase md:text-xs'>
                                            {stat.label}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
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

                        <div className='mb-8 space-y-8 border-l border-stone-800 pl-8'>
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
                                    Double Board-Certified Cosmetic Surgeon
                                </span>
                            </div>
                        </div>

                        {/* Board Certifications */}
                        <div className='mb-8 rounded-lg border border-stone-800 bg-stone-900/50 p-5'>
                            <h3 className='mb-4 flex items-center gap-2 text-sm font-bold tracking-wider text-white uppercase'>
                                <BadgeCheck className='text-gold-400 h-4 w-4' />
                                Verified Credentials
                            </h3>
                            <div className='space-y-3'>
                                <a
                                    href='https://www.americanboardcosmeticsurgery.org/'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='hover:border-gold-500/50 group flex items-center justify-between border-b border-stone-800 pb-3 transition-colors'
                                >
                                    <div>
                                        <span className='block text-sm font-medium text-white'>
                                            American Board of Cosmetic Surgery
                                        </span>
                                        <span className='text-xs text-stone-500'>
                                            Board Certified
                                        </span>
                                    </div>
                                    <ExternalLink className='text-gold-500 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100' />
                                </a>
                                <a
                                    href='https://www.flhealthsource.gov/mqa/'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='hover:border-gold-500/50 group flex items-center justify-between border-b border-stone-800 pb-3 transition-colors'
                                >
                                    <div>
                                        <span className='block text-sm font-medium text-white'>
                                            Florida Medical Quality Assurance
                                        </span>
                                        <span className='text-xs text-stone-500'>
                                            State Licensed
                                        </span>
                                    </div>
                                    <ExternalLink className='text-gold-500 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100' />
                                </a>
                                <div className='flex items-center justify-between pt-1'>
                                    <div>
                                        <span className='block text-sm font-medium text-white'>
                                            Fellowship Trained
                                        </span>
                                        <span className='text-xs text-stone-500'>
                                            Cosmetic Surgery & Body Contouring
                                        </span>
                                    </div>
                                    <Award className='text-gold-400 h-4 w-4' />
                                </div>
                            </div>
                        </div>

                        <div className='flex flex-wrap gap-4'>
                            <Button variant='gold' size='md' asChild>
                                <Link href='/about'>Meet The Team</Link>
                            </Button>
                            <Button
                                variant='outline'
                                className='border-stone-700 text-white hover:border-white hover:text-white'
                                asChild
                            >
                                <Link href='/about#credentials'>
                                    Full Credentials
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}

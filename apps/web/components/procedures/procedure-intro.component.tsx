'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ContainerLayout } from '@/components/container-layout.component'
import { cn } from '@workspace/ui/lib/utils'

interface ProcedureIntroProps {
    title: string
    description: string
    className?: string
}

export function ProcedureIntro({
    title,
    description,
    className,
}: ProcedureIntroProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start end', 'end start'],
    })

    const y = useTransform(scrollYProgress, [0, 1], [100, -100])
    const opacity = useTransform(
        scrollYProgress,
        [0, 0.2, 0.8, 1],
        [0, 0.05, 0.05, 0]
    )

    return (
        <section
            ref={containerRef}
            className={cn(
                'relative overflow-hidden bg-white py-24 lg:py-32',
                className
            )}
        >
            {/* Background Parallax Text */}
            <div className='pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden'>
                <motion.div
                    style={{ y, opacity }}
                    className='font-serif text-[15vw] leading-none font-bold whitespace-nowrap text-stone-900 uppercase select-none'
                >
                    {title.split(' ')[0]} {/* Use first word for background */}
                </motion.div>
            </div>

            <ContainerLayout>
                <div className='relative z-10 mx-auto max-w-3xl text-center'>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-100px' }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    >
                        <h2 className='mb-8 font-serif text-4xl font-medium text-stone-900 md:text-5xl lg:text-6xl'>
                            Refine Your{' '}
                            <span className='text-gold-600 italic'>Beauty</span>
                        </h2>
                        <div className='relative'>
                            <p className='text-lg leading-relaxed font-light text-stone-600 md:text-xl md:leading-loose'>
                                <span className='text-gold-500 float-left mr-3 font-serif text-6xl leading-[0.8]'>
                                    {description.charAt(0)}
                                </span>
                                {description.slice(1)}
                            </p>
                        </div>

                        <motion.div
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: true }}
                            transition={{
                                delay: 0.5,
                                duration: 0.8,
                                ease: 'circOut',
                            }}
                            className='bg-gold-400 mx-auto mt-12 h-[1px] w-24'
                        />
                    </motion.div>
                </div>
            </ContainerLayout>
        </section>
    )
}

'use client'

import { Clock, Syringe, Activity, Sparkles, Hotel } from 'lucide-react'
import type { ProcedureStats as ProcedureStatsType } from '@/lib/types/procedure.type'
import { cn } from '@workspace/ui/lib/utils'
import { ContainerLayout } from '@/components/container-layout.component'
import { motion } from 'framer-motion'

interface ProcedureStatsProps {
    stats: ProcedureStatsType
    className?: string
}

export function ProcedureStats({ stats, className }: ProcedureStatsProps) {
    const items = [
        {
            label: 'Duration',
            value: stats.duration,
            icon: Clock,
        },
        {
            label: 'Anesthesia',
            value: stats.anesthesia,
            icon: Syringe,
        },
        {
            label: 'Recovery',
            value: stats.recovery,
            icon: Activity,
        },
        {
            label: 'Results',
            value: stats.results,
            icon: Sparkles,
        },
    ]

    if (stats.inpatientOutpatient) {
        items.push({
            label: 'Setting',
            value: stats.inpatientOutpatient,
            icon: Hotel,
        })
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2,
            },
        },
    }

    const itemVariant = {
        hidden: { opacity: 0, y: 20 },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: 'easeOut',
            },
        },
    }

    return (
        <div
            className={cn(
                'relative overflow-hidden bg-stone-950 py-16 text-white',
                className
            )}
        >
            <ContainerLayout>
                <motion.div
                    variants={container}
                    initial='hidden'
                    whileInView='show'
                    viewport={{ once: true, margin: '-50px' }}
                    className='relative z-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4'
                >
                    {items.map((item, index) => (
                        <motion.div
                            key={item.label}
                            variants={itemVariant}
                            className={cn(
                                'group flex flex-col items-center rounded-lg p-6 text-center transition-all duration-300 hover:bg-white/5',
                                index !== items.length - 1 &&
                                    'lg:border-r lg:border-white/5 lg:hover:border-transparent'
                            )}
                        >
                            <div className='group-hover:border-gold-500/30 group-hover:from-gold-900/20 group-hover:shadow-gold-900/20 mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-stone-800 bg-gradient-to-br from-stone-800 to-stone-900 shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:to-stone-900'>
                                <item.icon
                                    className='text-gold-400 group-hover:text-gold-300 h-7 w-7 transition-colors duration-300'
                                    strokeWidth={1.5}
                                />
                            </div>
                            <dt className='mb-2 text-xs font-bold tracking-[0.2em] text-stone-400 uppercase transition-colors group-hover:text-stone-300'>
                                {item.label}
                            </dt>
                            <dd className='font-serif text-xl font-medium text-stone-100 group-hover:text-white'>
                                {item.value}
                            </dd>
                        </motion.div>
                    ))}
                </motion.div>
            </ContainerLayout>
        </div>
    )
}

/**
 * ContactStatsStrip Component
 *
 * Horizontal strip displaying key metrics and achievements.
 * Dark background with gold accents for visual impact.
 *
 * Features:
 * - Animated number counters on view
 * - Responsive grid layout
 * - Trust-building statistics
 */
'use client'

import { motion } from 'framer-motion'
import { Award, Users, Star, ShieldCheck } from 'lucide-react'

const STATS = [
    {
        icon: Users,
        value: '5,000+',
        label: 'Successful Procedures',
    },
    {
        icon: Award,
        value: '15+',
        label: 'Years of Excellence',
    },
    {
        icon: Star,
        value: '5.0',
        label: 'Star Rating',
    },
    {
        icon: ShieldCheck,
        value: 'AAAASF',
        label: 'Accredited Facility',
    },
]

export type ContactStatsStripProps = {
    readonly id?: string
}

export function ContactStatsStrip({ id = 'stats' }: ContactStatsStripProps) {
    return (
        <section
            id={id}
            className='relative overflow-hidden bg-stone-900 py-16'
        >
            {/* Background Decorations */}
            <div className='pointer-events-none absolute inset-0'>
                <div className='bg-gold-500/10 absolute top-1/2 -left-[10%] h-[300px] w-[300px] -translate-y-1/2 rounded-full blur-3xl' />
                <div className='bg-gold-500/5 absolute top-1/2 -right-[5%] h-[200px] w-[200px] -translate-y-1/2 rounded-full blur-3xl' />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diamond-upholstery.png')] opacity-[0.02]" />
            </div>

            <div className='relative z-10 container mx-auto px-6 md:px-12'>
                <div className='grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12'>
                    {STATS.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className='text-center'
                        >
                            {/* Icon */}
                            <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5'>
                                <stat.icon className='text-gold-400 h-6 w-6' />
                            </div>

                            {/* Value */}
                            <motion.div
                                initial={{ scale: 0.8 }}
                                whileInView={{ scale: 1 }}
                                transition={{
                                    duration: 0.4,
                                    delay: index * 0.1 + 0.2,
                                }}
                                viewport={{ once: true }}
                                className='text-gold-400 mb-2 font-serif text-3xl font-bold md:text-4xl'
                            >
                                {stat.value}
                            </motion.div>

                            {/* Label */}
                            <p className='text-sm font-medium tracking-wide text-stone-400'>
                                {stat.label}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

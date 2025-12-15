/**
 * SpecialsUrgencyStrip Component
 *
 * A horizontal strip displaying urgency messaging for expiring promotions.
 * Features countdown to the nearest expiring promotion.
 *
 * Features:
 * - Animated pulse effect for urgency
 * - Responsive design
 * - Links to consultation form
 */
'use client'

import { motion } from 'framer-motion'
import { Clock, ArrowRight } from 'lucide-react'

export type SpecialsUrgencyStripProps = {
    readonly id?: string
    /** Number of days remaining until the nearest promotion expires */
    readonly daysRemaining: number | null
}

export function SpecialsUrgencyStrip({
    id = 'urgency-strip',
    daysRemaining,
}: SpecialsUrgencyStripProps) {
    // Only show if promotion ends within 14 days
    if (daysRemaining === null || daysRemaining > 14) {
        return null
    }

    const urgencyLevel =
        daysRemaining <= 3 ? 'critical' : daysRemaining <= 7 ? 'high' : 'medium'

    const bgColor = {
        critical: 'bg-red-600',
        high: 'bg-orange-500',
        medium: 'bg-gold-500',
    }[urgencyLevel]

    const getMessage = () => {
        if (daysRemaining === 0) {
            return 'LAST CHANCE — Offers End Today!'
        }
        if (daysRemaining === 1) {
            return 'HURRY — Only 1 Day Left to Save!'
        }
        if (daysRemaining <= 3) {
            return `ACT NOW — Only ${daysRemaining} Days Left!`
        }
        return `Limited Time — Offers End in ${daysRemaining} Days`
    }

    return (
        <section id={id} className={`relative overflow-hidden ${bgColor}`}>
            {/* Animated Background Pulse */}
            <motion.div
                className='absolute inset-0 bg-white/10'
                animate={{
                    opacity: [0, 0.2, 0],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            <div className='relative z-10 container mx-auto px-6 py-4 md:px-12'>
                <div className='flex flex-col items-center justify-between gap-4 sm:flex-row'>
                    {/* Message */}
                    <div className='flex items-center gap-3 text-white'>
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        >
                            <Clock className='h-5 w-5' />
                        </motion.div>
                        <span className='text-sm font-bold tracking-wide uppercase md:text-base'>
                            {getMessage()}
                        </span>
                    </div>

                    {/* CTA */}
                    <a
                        href='#specials-form'
                        className='group flex items-center gap-2 rounded-full bg-white/20 px-5 py-2 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/30'
                    >
                        Claim Your Offer Now
                        <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
                    </a>
                </div>
            </div>
        </section>
    )
}

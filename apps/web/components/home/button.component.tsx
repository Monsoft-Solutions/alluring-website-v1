'use client'

import { ArrowRight } from 'lucide-react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { ReactNode } from 'react'
import { cn } from '@workspace/ui/lib/utils'

interface ButtonProps extends HTMLMotionProps<'button'> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gold'
    size?: 'sm' | 'md' | 'lg'
    withArrow?: boolean
    children?: ReactNode
    className?: string
}

export const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    withArrow = false,
    ...props
}: ButtonProps) => {
    const baseStyles =
        'relative overflow-hidden inline-flex items-center justify-center transition-all duration-500 font-sans tracking-[0.2em] uppercase text-sm font-bold group'

    const variants = {
        primary:
            'bg-stone-900 text-white border border-stone-900 hover:bg-stone-800 hover:text-gold-200',
        secondary:
            'bg-stone-50 text-stone-900 border border-stone-200 hover:border-gold-400',
        outline:
            'bg-transparent text-stone-900 border border-stone-300 hover:border-stone-900',
        gold: 'bg-gold-400 text-white border border-gold-400 hover:bg-gold-500',
        ghost: "bg-transparent text-stone-500 hover:text-stone-900 after:content-[''] after:block after:w-full after:h-[1px] after:bg-stone-900 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300",
    }

    const sizes = {
        sm: 'px-5 py-3',
        md: 'px-8 py-4',
        lg: 'px-10 py-5',
    }

    return (
        <motion.button
            whileHover={{ scale: 1.0 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                baseStyles,
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            <span className='relative z-10 flex items-center'>
                {children}
                {withArrow && (
                    <ArrowRight className='ml-3 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1' />
                )}
            </span>

            {/* Shine effect for primary/gold buttons */}
            {(variant === 'primary' || variant === 'gold') && (
                <div className='absolute inset-0 z-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer_1.5s_infinite]' />
            )}
        </motion.button>
    )
}

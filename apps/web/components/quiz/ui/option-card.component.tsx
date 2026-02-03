/**
 * Option Card Component
 *
 * Selectable card for quiz options with elegant animations.
 * Supports single and multi-select modes.
 *
 * @module components/quiz/ui/option-card
 */
'use client'

import { cn } from '@workspace/ui/lib/utils'
import { Check } from 'lucide-react'
import { motion } from 'framer-motion'

export interface OptionCardProps {
    /** The option value */
    readonly value: string
    /** Display label */
    readonly label: string
    /** Optional description */
    readonly description?: string
    /** Whether this option is selected */
    readonly isSelected: boolean
    /** Click handler */
    readonly onClick: () => void
    /** Whether to show as disabled */
    readonly disabled?: boolean
    /** Card size variant */
    readonly size?: 'sm' | 'md' | 'lg'
    /** Whether to show checkmark when selected */
    readonly showCheckmark?: boolean
    /** Optional icon component */
    readonly icon?: React.ReactNode
    /** Additional class names */
    readonly className?: string
}

/**
 * OptionCard - Elegant selectable option card
 */
export function OptionCard({
    label,
    description,
    isSelected,
    onClick,
    disabled = false,
    size = 'md',
    showCheckmark = true,
    icon,
    className,
}: OptionCardProps) {
    const sizeClasses = {
        sm: 'p-4',
        md: 'p-5',
        lg: 'p-6',
    }

    return (
        <motion.button
            type='button'
            onClick={onClick}
            disabled={disabled}
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            className={cn(
                // Base styles
                'group relative w-full rounded-xl border-2 text-left transition-all duration-300',
                // Background with glassmorphism
                'bg-white/80 backdrop-blur-xl',
                // Size
                sizeClasses[size],
                // States
                isSelected
                    ? 'border-gold-500 shadow-[0_0_20px_rgba(212,175,55,0.15)]'
                    : 'border-stone-200 hover:border-stone-300',
                // Disabled
                disabled && 'cursor-not-allowed opacity-50',
                className
            )}
        >
            {/* Selected indicator glow */}
            {isSelected && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className='from-gold-500/5 to-gold-500/10 absolute inset-0 rounded-xl bg-gradient-to-br'
                />
            )}

            <div className='relative flex items-start gap-4'>
                {/* Icon */}
                {icon && (
                    <div
                        className={cn(
                            'flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors',
                            isSelected
                                ? 'bg-gold-500/20 text-gold-600'
                                : 'bg-stone-100 text-stone-500 group-hover:bg-stone-200'
                        )}
                    >
                        {icon}
                    </div>
                )}

                {/* Content */}
                <div className='flex-1'>
                    <span
                        className={cn(
                            'block font-medium transition-colors',
                            size === 'lg' ? 'text-lg' : 'text-base',
                            isSelected ? 'text-stone-900' : 'text-stone-700'
                        )}
                    >
                        {label}
                    </span>
                    {description && (
                        <span
                            className={cn(
                                'mt-1 block text-sm transition-colors',
                                isSelected ? 'text-stone-600' : 'text-stone-500'
                            )}
                        >
                            {description}
                        </span>
                    )}
                </div>

                {/* Checkmark */}
                {showCheckmark && (
                    <div
                        className={cn(
                            'flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all',
                            isSelected
                                ? 'bg-gold-500 text-white'
                                : 'border-2 border-stone-300 bg-white'
                        )}
                    >
                        {isSelected && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 500,
                                    damping: 30,
                                }}
                            >
                                <Check className='h-4 w-4' strokeWidth={3} />
                            </motion.div>
                        )}
                    </div>
                )}
            </div>
        </motion.button>
    )
}

/**
 * Option card grid container
 */
export interface OptionCardGridProps {
    readonly children: React.ReactNode
    readonly columns?: 1 | 2 | 3
    readonly className?: string
}

export function OptionCardGrid({
    children,
    columns = 1,
    className,
}: OptionCardGridProps) {
    const columnClasses = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    }

    return (
        <div className={cn('grid gap-4', columnClasses[columns], className)}>
            {children}
        </div>
    )
}

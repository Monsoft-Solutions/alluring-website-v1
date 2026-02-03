/**
 * Procedure Card Component
 *
 * Display card for recommended procedures in quiz results.
 * Shows procedure details, pricing, and benefits.
 *
 * @module components/quiz/ui/procedure-card
 */
'use client'

import { cn } from '@workspace/ui/lib/utils'
import { motion } from 'framer-motion'
import { Check, Clock, CreditCard, Sparkles, Star } from 'lucide-react'
import Link from 'next/link'
import type {
    ProcedureDetails,
    ProcedureRecommendation,
} from '../lib/quiz-types'

export interface ProcedureCardProps {
    /** Procedure details */
    readonly procedure: ProcedureDetails
    /** Recommendation data */
    readonly recommendation?: ProcedureRecommendation
    /** Whether this is the primary recommendation */
    readonly isPrimary?: boolean
    /** Whether the card is selectable (for package builder) */
    readonly selectable?: boolean
    /** Whether the card is selected */
    readonly isSelected?: boolean
    /** Click handler for selection */
    readonly onSelect?: () => void
    /** Social proof message */
    readonly socialProof?: string
    /** Additional class names */
    readonly className?: string
}

/**
 * ProcedureCard - Elegant procedure display card
 */
export function ProcedureCard({
    procedure,
    recommendation,
    isPrimary = false,
    selectable = false,
    isSelected = false,
    onSelect,
    socialProof,
    className,
}: ProcedureCardProps) {
    const CardWrapper = selectable ? motion.button : motion.div

    return (
        <CardWrapper
            type={selectable ? 'button' : undefined}
            onClick={selectable ? onSelect : undefined}
            whileHover={{ y: selectable ? -4 : 0 }}
            className={cn(
                'relative overflow-hidden rounded-2xl text-left transition-all duration-300',
                isPrimary
                    ? 'bg-gradient-to-br from-stone-900 to-stone-800 text-white'
                    : 'border-2 bg-white',
                selectable &&
                    !isPrimary &&
                    (isSelected
                        ? 'border-gold-500 shadow-gold-500/20 shadow-lg'
                        : 'border-stone-200 hover:border-stone-300'),
                selectable && 'cursor-pointer',
                className
            )}
        >
            {/* Primary badge */}
            {isPrimary && (
                <div className='from-gold-500 to-gold-400 absolute top-0 right-0 left-0 bg-gradient-to-r py-2 text-center'>
                    <span className='text-xs font-bold tracking-widest text-stone-900 uppercase'>
                        Perfect Match for You
                    </span>
                </div>
            )}

            {/* Selection indicator */}
            {selectable && !isPrimary && (
                <div
                    className={cn(
                        'absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full transition-all',
                        isSelected
                            ? 'bg-gold-500 text-white'
                            : 'border-2 border-stone-300 bg-white'
                    )}
                >
                    {isSelected && (
                        <Check className='h-4 w-4' strokeWidth={3} />
                    )}
                </div>
            )}

            {/* Content */}
            <div className={cn('p-6', isPrimary && 'pt-12')}>
                {/* Title */}
                <h3
                    className={cn(
                        'font-serif text-2xl',
                        isPrimary ? 'text-white' : 'text-stone-900'
                    )}
                >
                    {procedure.title}
                </h3>

                {/* Description */}
                <p
                    className={cn(
                        'mt-2 text-sm',
                        isPrimary ? 'text-stone-300' : 'text-stone-600'
                    )}
                >
                    {procedure.shortDescription}
                </p>

                {/* Matched concerns */}
                {recommendation &&
                    recommendation.matchedConcerns.length > 0 && (
                        <div className='mt-4'>
                            <p
                                className={cn(
                                    'mb-2 text-xs font-semibold tracking-wider uppercase',
                                    isPrimary
                                        ? 'text-gold-400'
                                        : 'text-gold-600'
                                )}
                            >
                                Addresses Your Goals
                            </p>
                            <div className='flex flex-wrap gap-2'>
                                {recommendation.matchedConcerns.map(
                                    (concern) => (
                                        <span
                                            key={concern}
                                            className={cn(
                                                'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs',
                                                isPrimary
                                                    ? 'bg-white/10 text-white'
                                                    : 'bg-stone-100 text-stone-700'
                                            )}
                                        >
                                            <Check className='h-3 w-3' />
                                            {concern}
                                        </span>
                                    )
                                )}
                            </div>
                        </div>
                    )}

                {/* Stats row */}
                <div
                    className={cn(
                        'mt-6 grid grid-cols-2 gap-4 border-t pt-4',
                        isPrimary ? 'border-stone-700' : 'border-stone-100'
                    )}
                >
                    {/* Payment options */}
                    <div className='flex items-center gap-2'>
                        <CreditCard
                            className={cn(
                                'h-4 w-4',
                                isPrimary ? 'text-gold-400' : 'text-gold-500'
                            )}
                        />
                        <div>
                            <p
                                className={cn(
                                    'text-xs',
                                    isPrimary
                                        ? 'text-stone-400'
                                        : 'text-stone-500'
                                )}
                            >
                                Flexible payment options
                            </p>
                            <p
                                className={cn(
                                    'text-xs font-medium',
                                    isPrimary
                                        ? 'text-stone-300'
                                        : 'text-stone-700'
                                )}
                            >
                                Financing & full payment available
                            </p>
                        </div>
                    </div>

                    {/* Recovery */}
                    <div className='flex items-center gap-2'>
                        <Clock
                            className={cn(
                                'h-4 w-4',
                                isPrimary ? 'text-gold-400' : 'text-gold-500'
                            )}
                        />
                        <div>
                            <p
                                className={cn(
                                    'text-xs',
                                    isPrimary
                                        ? 'text-stone-400'
                                        : 'text-stone-500'
                                )}
                            >
                                Recovery
                            </p>
                            <p
                                className={cn(
                                    'font-semibold',
                                    isPrimary ? 'text-white' : 'text-stone-900'
                                )}
                            >
                                ~{procedure.recoveryWeeks} week
                                {procedure.recoveryWeeks !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Benefits */}
                {procedure.benefits.length > 0 && (
                    <div className='mt-4'>
                        <ul className='space-y-2'>
                            {procedure.benefits.slice(0, 3).map((benefit) => (
                                <li
                                    key={benefit}
                                    className={cn(
                                        'flex items-start gap-2 text-sm',
                                        isPrimary
                                            ? 'text-stone-300'
                                            : 'text-stone-600'
                                    )}
                                >
                                    <Sparkles
                                        className={cn(
                                            'mt-0.5 h-4 w-4 shrink-0',
                                            isPrimary
                                                ? 'text-gold-400'
                                                : 'text-gold-500'
                                        )}
                                    />
                                    {benefit}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Social proof */}
                {socialProof && (
                    <div
                        className={cn(
                            'mt-4 flex items-center gap-2 rounded-lg p-3',
                            isPrimary ? 'bg-white/10' : 'bg-stone-50'
                        )}
                    >
                        <Star
                            className={cn(
                                'h-4 w-4',
                                isPrimary ? 'text-gold-400' : 'text-gold-500'
                            )}
                            fill='currentColor'
                        />
                        <p
                            className={cn(
                                'text-sm',
                                isPrimary ? 'text-stone-300' : 'text-stone-600'
                            )}
                        >
                            {socialProof}
                        </p>
                    </div>
                )}

                {/* Learn more link (for primary card) */}
                {isPrimary && (
                    <Link
                        href={`/procedures/${procedure.slug}`}
                        className='text-gold-400 hover:text-gold-300 mt-6 inline-flex items-center gap-2 text-sm font-medium transition-colors'
                    >
                        Learn more about this procedure
                        <svg
                            className='h-4 w-4'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                d='M9 5l7 7-7 7'
                            />
                        </svg>
                    </Link>
                )}
            </div>
        </CardWrapper>
    )
}

/**
 * Mini procedure card for package builder
 */
export interface MiniProcedureCardProps {
    readonly procedure: ProcedureDetails
    readonly isSelected: boolean
    readonly onToggle: () => void
    readonly className?: string
}

export function MiniProcedureCard({
    procedure,
    isSelected,
    onToggle,
    className,
}: MiniProcedureCardProps) {
    return (
        <motion.button
            type='button'
            onClick={onToggle}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                'flex items-center gap-4 rounded-xl p-4 text-left transition-all duration-300',
                'border-2',
                isSelected
                    ? 'border-gold-500 from-gold-50 bg-gradient-to-br to-white shadow-md'
                    : 'border-stone-200 bg-white hover:border-stone-300',
                className
            )}
        >
            {/* Checkbox */}
            <div
                className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all',
                    isSelected
                        ? 'bg-gold-500 text-white'
                        : 'border-2 border-stone-300 bg-white'
                )}
            >
                {isSelected && <Check className='h-4 w-4' strokeWidth={3} />}
            </div>

            {/* Info */}
            <div className='min-w-0 flex-1'>
                <p
                    className={cn(
                        'truncate font-medium',
                        isSelected ? 'text-stone-900' : 'text-stone-700'
                    )}
                >
                    {procedure.title}
                </p>
                <p className='text-sm text-stone-500'>
                    ~{procedure.recoveryWeeks} week
                    {procedure.recoveryWeeks !== 1 ? 's' : ''} recovery
                </p>
            </div>
        </motion.button>
    )
}

/**
 * Package summary card
 */
export interface PackageSummaryProps {
    readonly procedures: readonly ProcedureDetails[]
    readonly className?: string
}

export function PackageSummary({ procedures, className }: PackageSummaryProps) {
    if (procedures.length === 0) return null

    return (
        <div
            className={cn(
                'rounded-xl bg-gradient-to-br from-stone-900 to-stone-800 p-6 text-white',
                className
            )}
        >
            <h4 className='text-gold-400 text-sm font-semibold tracking-wider uppercase'>
                Your Package
            </h4>

            {/* Selected procedures */}
            <ul className='mt-3 space-y-2'>
                {procedures.map((p) => (
                    <li key={p.id} className='flex items-center gap-2 text-sm'>
                        <Check className='text-gold-400 h-4 w-4' />
                        {p.title}
                    </li>
                ))}
            </ul>

            {/* Payment options */}
            <div className='mt-4 border-t border-stone-700 pt-4'>
                <div className='flex justify-between text-sm'>
                    <span className='text-stone-400'>Payment Options</span>
                    <span className='text-gold-400 font-semibold'>
                        Financing & upfront payment available
                    </span>
                </div>
                <div className='mt-3 flex flex-wrap gap-2'>
                    {['Cherry', 'CareCredit', 'United Credit'].map(
                        (partner) => (
                            <span
                                key={partner}
                                className='rounded-full bg-white/10 px-3 py-1 text-xs text-stone-300'
                            >
                                {partner}
                            </span>
                        )
                    )}
                </div>
            </div>
        </div>
    )
}

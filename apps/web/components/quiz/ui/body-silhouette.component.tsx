/**
 * Body Silhouette Component
 *
 * Interactive SVG body selector for choosing treatment areas.
 * Elegant female silhouette with clickable zones.
 *
 * @module components/quiz/ui/body-silhouette
 */
'use client'

import { cn } from '@workspace/ui/lib/utils'
import { motion } from 'framer-motion'
import type { BodyArea } from '../lib/quiz-types'

export interface BodySilhouetteProps {
    /** Currently selected areas */
    readonly selectedAreas: readonly BodyArea[]
    /** Toggle area selection */
    readonly onToggleArea: (area: BodyArea) => void
    /** Additional class names */
    readonly className?: string
}

/**
 * BodySilhouette - Interactive body area selector
 */
export function BodySilhouette({
    selectedAreas,
    onToggleArea,
    className,
}: BodySilhouetteProps) {
    const isSelected = (area: BodyArea) => selectedAreas.includes(area)

    return (
        <div className={cn('relative mx-auto w-full max-w-sm', className)}>
            {/* SVG Silhouette */}
            <svg
                viewBox='0 0 200 400'
                className='w-full'
                aria-label='Select body areas for treatment'
            >
                {/* Background gradient */}
                <defs>
                    <linearGradient
                        id='bodyGradient'
                        x1='0%'
                        y1='0%'
                        x2='0%'
                        y2='100%'
                    >
                        <stop offset='0%' stopColor='#f5f5f4' />
                        <stop offset='100%' stopColor='#e7e5e4' />
                    </linearGradient>
                    <linearGradient
                        id='selectedGradient'
                        x1='0%'
                        y1='0%'
                        x2='0%'
                        y2='100%'
                    >
                        <stop offset='0%' stopColor='#d4af37' />
                        <stop offset='100%' stopColor='#b8941c' />
                    </linearGradient>
                    <filter id='glow'>
                        <feGaussianBlur stdDeviation='3' result='coloredBlur' />
                        <feMerge>
                            <feMergeNode in='coloredBlur' />
                            <feMergeNode in='SourceGraphic' />
                        </feMerge>
                    </filter>
                </defs>

                {/* Head/Face zone - clickable */}
                <motion.g
                    onClick={() => onToggleArea('face')}
                    style={{ cursor: 'pointer' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {/* Face circle */}
                    <ellipse
                        cx='100'
                        cy='45'
                        rx='28'
                        ry='35'
                        fill={
                            isSelected('face')
                                ? 'url(#selectedGradient)'
                                : 'url(#bodyGradient)'
                        }
                        stroke={isSelected('face') ? '#d4af37' : '#a8a29e'}
                        strokeWidth='2'
                        filter={isSelected('face') ? 'url(#glow)' : undefined}
                        className='transition-all duration-300'
                    />
                    {/* Neck */}
                    <rect
                        x='90'
                        y='75'
                        width='20'
                        height='15'
                        fill={
                            isSelected('face')
                                ? 'url(#selectedGradient)'
                                : 'url(#bodyGradient)'
                        }
                        className='transition-all duration-300'
                    />
                </motion.g>

                {/* Torso/Body base (non-clickable, just for visual) */}
                <path
                    d='M60 90 Q40 95 40 130 L40 240 Q40 260 60 270 L80 280 L80 380 L120 380 L120 280 L140 270 Q160 260 160 240 L160 130 Q160 95 140 90 Z'
                    fill='url(#bodyGradient)'
                    stroke='#a8a29e'
                    strokeWidth='1'
                    className='pointer-events-none'
                />

                {/* Breast zone - clickable */}
                <motion.g
                    onClick={() => onToggleArea('breast')}
                    style={{ cursor: 'pointer' }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {/* Left breast */}
                    <ellipse
                        cx='75'
                        cy='130'
                        rx='22'
                        ry='20'
                        fill={
                            isSelected('breast')
                                ? 'url(#selectedGradient)'
                                : 'url(#bodyGradient)'
                        }
                        stroke={isSelected('breast') ? '#d4af37' : '#a8a29e'}
                        strokeWidth='2'
                        filter={isSelected('breast') ? 'url(#glow)' : undefined}
                        className='transition-all duration-300'
                    />
                    {/* Right breast */}
                    <ellipse
                        cx='125'
                        cy='130'
                        rx='22'
                        ry='20'
                        fill={
                            isSelected('breast')
                                ? 'url(#selectedGradient)'
                                : 'url(#bodyGradient)'
                        }
                        stroke={isSelected('breast') ? '#d4af37' : '#a8a29e'}
                        strokeWidth='2'
                        filter={isSelected('breast') ? 'url(#glow)' : undefined}
                        className='transition-all duration-300'
                    />
                </motion.g>

                {/* Body zone (tummy, hips, buttocks) - clickable */}
                <motion.g
                    onClick={() => onToggleArea('body')}
                    style={{ cursor: 'pointer' }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {/* Tummy/Waist area */}
                    <path
                        d='M55 155 Q50 180 55 220 Q60 250 75 260 L125 260 Q140 250 145 220 Q150 180 145 155 Q140 165 100 165 Q60 165 55 155 Z'
                        fill={
                            isSelected('body')
                                ? 'url(#selectedGradient)'
                                : 'url(#bodyGradient)'
                        }
                        stroke={isSelected('body') ? '#d4af37' : '#a8a29e'}
                        strokeWidth='2'
                        filter={isSelected('body') ? 'url(#glow)' : undefined}
                        className='transition-all duration-300'
                    />
                    {/* Hips/Buttocks accent */}
                    <ellipse
                        cx='100'
                        cy='255'
                        rx='35'
                        ry='15'
                        fill={
                            isSelected('body')
                                ? 'url(#selectedGradient)'
                                : 'url(#bodyGradient)'
                        }
                        stroke={isSelected('body') ? '#d4af37' : '#a8a29e'}
                        strokeWidth='2'
                        filter={isSelected('body') ? 'url(#glow)' : undefined}
                        className='transition-all duration-300'
                    />
                </motion.g>

                {/* Arms (decorative, non-clickable) */}
                <path
                    d='M40 95 Q25 100 20 140 Q18 180 25 220'
                    fill='none'
                    stroke='#a8a29e'
                    strokeWidth='12'
                    strokeLinecap='round'
                    className='pointer-events-none'
                />
                <path
                    d='M160 95 Q175 100 180 140 Q182 180 175 220'
                    fill='none'
                    stroke='#a8a29e'
                    strokeWidth='12'
                    strokeLinecap='round'
                    className='pointer-events-none'
                />

                {/* Legs (decorative, non-clickable) */}
                <path
                    d='M85 275 L80 380'
                    fill='none'
                    stroke='#a8a29e'
                    strokeWidth='18'
                    strokeLinecap='round'
                    className='pointer-events-none'
                />
                <path
                    d='M115 275 L120 380'
                    fill='none'
                    stroke='#a8a29e'
                    strokeWidth='18'
                    strokeLinecap='round'
                    className='pointer-events-none'
                />
            </svg>

            {/* Labels */}
            <div className='absolute top-6 left-1/2 -translate-x-1/2'>
                <AreaLabel
                    label='Face'
                    isSelected={isSelected('face')}
                    onClick={() => onToggleArea('face')}
                    position='top'
                />
            </div>
            <div className='absolute top-28 -left-2'>
                <AreaLabel
                    label='Breast'
                    isSelected={isSelected('breast')}
                    onClick={() => onToggleArea('breast')}
                    position='left'
                />
            </div>
            <div className='absolute top-48 -right-2'>
                <AreaLabel
                    label='Body'
                    isSelected={isSelected('body')}
                    onClick={() => onToggleArea('body')}
                    position='right'
                />
            </div>
        </div>
    )
}

/**
 * Area label component
 */
interface AreaLabelProps {
    readonly label: string
    readonly isSelected: boolean
    readonly onClick: () => void
    readonly position: 'top' | 'left' | 'right'
}

function AreaLabel({ label, isSelected, onClick, position }: AreaLabelProps) {
    return (
        <motion.button
            type='button'
            onClick={onClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-all duration-300',
                isSelected
                    ? 'bg-gold-500 shadow-gold-500/30 text-white shadow-lg'
                    : 'bg-white/80 text-stone-600 shadow-md hover:bg-white',
                position === 'left' && 'origin-right',
                position === 'right' && 'origin-left'
            )}
        >
            {label}
        </motion.button>
    )
}

/**
 * Alternative card-based body area selector (mobile-friendly)
 */
export interface BodyAreaCardsProps {
    readonly selectedAreas: readonly BodyArea[]
    readonly onToggleArea: (area: BodyArea) => void
    readonly className?: string
}

export function BodyAreaCards({
    selectedAreas,
    onToggleArea,
    className,
}: BodyAreaCardsProps) {
    const areas: {
        area: BodyArea
        label: string
        description: string
        icon: string
    }[] = [
        {
            area: 'face',
            label: 'Face',
            description: 'Eyelids, skin tightening, rejuvenation',
            icon: '✨',
        },
        {
            area: 'breast',
            label: 'Breast',
            description: 'Size, shape, lift, or reduction',
            icon: '💫',
        },
        {
            area: 'body',
            label: 'Body',
            description: 'Contouring, tummy, curves',
            icon: '🌟',
        },
    ]

    return (
        <div className={cn('grid grid-cols-1 gap-4 md:grid-cols-3', className)}>
            {areas.map(({ area, label, description, icon }) => {
                const isSelected = selectedAreas.includes(area)

                return (
                    <motion.button
                        key={area}
                        type='button'
                        onClick={() => onToggleArea(area)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                            'relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300',
                            'border-2',
                            isSelected
                                ? 'border-gold-500 from-gold-50 shadow-gold-500/20 bg-gradient-to-br to-white shadow-lg'
                                : 'border-stone-200 bg-white/80 hover:border-stone-300 hover:bg-white'
                        )}
                    >
                        {/* Selection indicator */}
                        {isSelected && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className='bg-gold-500 absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full text-white'
                            >
                                <svg
                                    className='h-4 w-4'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                    strokeWidth={3}
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        d='M5 13l4 4L19 7'
                                    />
                                </svg>
                            </motion.div>
                        )}

                        {/* Icon */}
                        <span className='text-3xl'>{icon}</span>

                        {/* Label */}
                        <h3
                            className={cn(
                                'mt-3 text-lg font-semibold',
                                isSelected ? 'text-stone-900' : 'text-stone-700'
                            )}
                        >
                            {label}
                        </h3>

                        {/* Description */}
                        <p
                            className={cn(
                                'mt-1 text-sm',
                                isSelected ? 'text-stone-600' : 'text-stone-500'
                            )}
                        >
                            {description}
                        </p>
                    </motion.button>
                )
            })}
        </div>
    )
}

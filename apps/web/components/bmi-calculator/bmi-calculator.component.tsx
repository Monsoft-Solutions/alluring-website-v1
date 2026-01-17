'use client'

/**
 * BMI Calculator Component
 *
 * Interactive BMI calculator with:
 * - Unit toggle: Imperial (default) / Metric
 * - Imperial inputs: height (ft + in), weight (lbs)
 * - Metric inputs: height (cm), weight (kg)
 * - Real-time calculation as user types
 * - Glassmorphism styling
 * - Mobile-optimized numeric inputs
 */
import { useState, useCallback, useMemo } from 'react'
import { Calculator, Scale, Ruler } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'

import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'
import { SectionHeader } from '@/components/shared/section-header.component'
import { BmiResultDisplay } from './bmi-result-display.component'
import { useAnalyticsEvent } from '@/lib/analytics/useAnalyticsEvent.hook'

type UnitSystem = 'imperial' | 'metric'

type BmiCalculatorProps = {
    readonly id?: string
    readonly variant?:
        | 'default'
        | 'muted'
        | 'accent'
        | 'gradient'
        | 'gradient-reverse'
        | 'subtle'
    readonly className?: string
}

/**
 * Convert feet and inches to centimeters
 */
function feetInchesToCm(feet: number, inches: number): number {
    return (feet * 12 + inches) * 2.54
}

/**
 * Convert pounds to kilograms
 */
function lbsToKg(lbs: number): number {
    return lbs * 0.453592
}

/**
 * Calculate BMI: weight(kg) / height(m)^2
 */
function calculateBMI(weightKg: number, heightCm: number): number | null {
    if (weightKg <= 0 || heightCm <= 0) return null
    const heightM = heightCm / 100
    return weightKg / (heightM * heightM)
}

export function BmiCalculator({
    id = 'bmi-calculator',
    variant = 'default',
    className,
}: BmiCalculatorProps) {
    const { track } = useAnalyticsEvent()

    // Unit system state
    const [unitSystem, setUnitSystem] = useState<UnitSystem>('imperial')

    // Imperial inputs
    const [feet, setFeet] = useState<string>('')
    const [inches, setInches] = useState<string>('')
    const [weightLbs, setWeightLbs] = useState<string>('')

    // Metric inputs
    const [heightCm, setHeightCm] = useState<string>('')
    const [weightKg, setWeightKg] = useState<string>('')

    // Calculate BMI based on current unit system
    const bmi = useMemo(() => {
        if (unitSystem === 'imperial') {
            const feetNum = parseFloat(feet) || 0
            const inchesNum = parseFloat(inches) || 0
            const weightNum = parseFloat(weightLbs) || 0

            if (feetNum <= 0 && inchesNum <= 0) return null
            if (weightNum <= 0) return null

            const heightInCm = feetInchesToCm(feetNum, inchesNum)
            const weightInKg = lbsToKg(weightNum)

            return calculateBMI(weightInKg, heightInCm)
        } else {
            const heightNum = parseFloat(heightCm) || 0
            const weightNum = parseFloat(weightKg) || 0

            if (heightNum <= 0 || weightNum <= 0) return null

            return calculateBMI(weightNum, heightNum)
        }
    }, [unitSystem, feet, inches, weightLbs, heightCm, weightKg])

    // Handle unit toggle
    const handleUnitToggle = useCallback(
        (system: UnitSystem) => {
            if (system !== unitSystem) {
                setUnitSystem(system)
                track('bmi_unit_toggle', {
                    from_unit: unitSystem,
                    to_unit: system,
                })
            }
        },
        [unitSystem, track]
    )

    // Track BMI calculation when a valid result is shown
    const handleInputChange = useCallback(
        (field: string, value: string, setter: (v: string) => void) => {
            setter(value)
            // Track calculation when user finishes entering data
            if (bmi !== null) {
                track('bmi_calculated', {
                    bmi_value: bmi.toFixed(1),
                    unit_system: unitSystem,
                })
            }
        },
        [bmi, unitSystem, track]
    )

    return (
        <SectionContainer id={id} variant={variant} className={className}>
            <ContentWrapper size='lg'>
                {/* Section Header */}
                <SectionHeader
                    badge='Free Calculator'
                    title='Calculate Your BMI'
                    description='Enter your height and weight below to instantly calculate your Body Mass Index and understand your candidacy for cosmetic procedures.'
                    align='center'
                    className='mb-12'
                />

                {/* Calculator Grid */}
                <div className='grid items-start gap-8 lg:grid-cols-2'>
                    {/* Calculator Form */}
                    <div className='rounded-xl border border-stone-200 bg-white/80 p-6 shadow-lg backdrop-blur-xl md:p-8'>
                        {/* Unit Toggle */}
                        <div className='mb-8'>
                            <label className='mb-3 block text-sm font-medium text-stone-700'>
                                Measurement System
                            </label>
                            <div className='grid grid-cols-2 gap-2 rounded-lg bg-stone-100 p-1'>
                                <Button
                                    type='button'
                                    variant={
                                        unitSystem === 'imperial'
                                            ? 'default'
                                            : 'ghost'
                                    }
                                    onClick={() => handleUnitToggle('imperial')}
                                    className={cn(
                                        'rounded-md py-3 text-sm font-medium transition-all',
                                        unitSystem === 'imperial'
                                            ? 'bg-white text-stone-900 shadow-sm'
                                            : 'text-stone-600 hover:text-stone-900'
                                    )}
                                >
                                    Imperial (ft, lbs)
                                </Button>
                                <Button
                                    type='button'
                                    variant={
                                        unitSystem === 'metric'
                                            ? 'default'
                                            : 'ghost'
                                    }
                                    onClick={() => handleUnitToggle('metric')}
                                    className={cn(
                                        'rounded-md py-3 text-sm font-medium transition-all',
                                        unitSystem === 'metric'
                                            ? 'bg-white text-stone-900 shadow-sm'
                                            : 'text-stone-600 hover:text-stone-900'
                                    )}
                                >
                                    Metric (cm, kg)
                                </Button>
                            </div>
                        </div>

                        {/* Height Input */}
                        <div className='mb-6'>
                            <label className='mb-3 flex items-center gap-2 text-sm font-medium text-stone-700'>
                                <Ruler className='h-4 w-4 text-stone-400' />
                                Height
                            </label>

                            {unitSystem === 'imperial' ? (
                                <div className='grid grid-cols-2 gap-4'>
                                    <div>
                                        <div className='relative'>
                                            <input
                                                type='number'
                                                inputMode='numeric'
                                                placeholder='5'
                                                value={feet}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        'feet',
                                                        e.target.value,
                                                        setFeet
                                                    )
                                                }
                                                className='focus:border-gold-500 focus:ring-gold-500/20 w-full rounded-lg border border-stone-200 bg-white px-4 py-3 pr-12 text-lg transition-colors focus:ring-2 focus:outline-none'
                                                min='0'
                                                max='8'
                                            />
                                            <span className='absolute top-1/2 right-4 -translate-y-1/2 text-sm text-stone-400'>
                                                ft
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className='relative'>
                                            <input
                                                type='number'
                                                inputMode='numeric'
                                                placeholder='6'
                                                value={inches}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        'inches',
                                                        e.target.value,
                                                        setInches
                                                    )
                                                }
                                                className='focus:border-gold-500 focus:ring-gold-500/20 w-full rounded-lg border border-stone-200 bg-white px-4 py-3 pr-12 text-lg transition-colors focus:ring-2 focus:outline-none'
                                                min='0'
                                                max='11'
                                            />
                                            <span className='absolute top-1/2 right-4 -translate-y-1/2 text-sm text-stone-400'>
                                                in
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className='relative'>
                                    <input
                                        type='number'
                                        inputMode='numeric'
                                        placeholder='170'
                                        value={heightCm}
                                        onChange={(e) =>
                                            handleInputChange(
                                                'heightCm',
                                                e.target.value,
                                                setHeightCm
                                            )
                                        }
                                        className='focus:border-gold-500 focus:ring-gold-500/20 w-full rounded-lg border border-stone-200 bg-white px-4 py-3 pr-12 text-lg transition-colors focus:ring-2 focus:outline-none'
                                        min='0'
                                        max='250'
                                    />
                                    <span className='absolute top-1/2 right-4 -translate-y-1/2 text-sm text-stone-400'>
                                        cm
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Weight Input */}
                        <div className='mb-8'>
                            <label className='mb-3 flex items-center gap-2 text-sm font-medium text-stone-700'>
                                <Scale className='h-4 w-4 text-stone-400' />
                                Weight
                            </label>

                            {unitSystem === 'imperial' ? (
                                <div className='relative'>
                                    <input
                                        type='number'
                                        inputMode='numeric'
                                        placeholder='150'
                                        value={weightLbs}
                                        onChange={(e) =>
                                            handleInputChange(
                                                'weightLbs',
                                                e.target.value,
                                                setWeightLbs
                                            )
                                        }
                                        className='focus:border-gold-500 focus:ring-gold-500/20 w-full rounded-lg border border-stone-200 bg-white px-4 py-3 pr-12 text-lg transition-colors focus:ring-2 focus:outline-none'
                                        min='0'
                                        max='700'
                                    />
                                    <span className='absolute top-1/2 right-4 -translate-y-1/2 text-sm text-stone-400'>
                                        lbs
                                    </span>
                                </div>
                            ) : (
                                <div className='relative'>
                                    <input
                                        type='number'
                                        inputMode='numeric'
                                        placeholder='70'
                                        value={weightKg}
                                        onChange={(e) =>
                                            handleInputChange(
                                                'weightKg',
                                                e.target.value,
                                                setWeightKg
                                            )
                                        }
                                        className='focus:border-gold-500 focus:ring-gold-500/20 w-full rounded-lg border border-stone-200 bg-white px-4 py-3 pr-12 text-lg transition-colors focus:ring-2 focus:outline-none'
                                        min='0'
                                        max='350'
                                    />
                                    <span className='absolute top-1/2 right-4 -translate-y-1/2 text-sm text-stone-400'>
                                        kg
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Calculator Icon and Helper Text */}
                        <div className='flex items-center gap-3 rounded-lg bg-stone-50 p-4'>
                            <Calculator className='text-gold-500 h-5 w-5' />
                            <p className='text-sm text-stone-600'>
                                Your BMI is calculated automatically as you
                                enter your measurements.
                            </p>
                        </div>
                    </div>

                    {/* Result Display */}
                    <BmiResultDisplay bmi={bmi} />
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}

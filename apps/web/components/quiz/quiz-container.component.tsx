/**
 * Quiz Container Component
 *
 * Main orchestration component for the quiz flow.
 * Manages state, navigation, and step rendering.
 *
 * @module components/quiz/quiz-container
 */
'use client'

import { cn } from '@workspace/ui/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { useAnalyticsEvent } from '@/lib/analytics/useAnalyticsEvent.hook'
import { trackEvent } from '@/lib/analytics/analytics.client'
import { useContactFormSubmission } from '@/hooks/useContactFormSubmission.hook'
import { CONTACT_SOURCES } from '@/lib/types/forms/contact-form.type'
import {
    type BodyArea,
    type BodyConcern,
    type BreastConcern,
    type BudgetRange,
    type Concern,
    type FaceConcern,
    type LifeEvent,
    type ProcedureId,
    type QuizAction,
    type QuizLeadData,
    type QuizState,
    type QuizStep,
    type RecoveryTime,
    calculateTotalSteps,
    getCurrentStepNumber,
    getNextStep,
    getPreviousStep,
    initialQuizState,
} from './lib/quiz-types'
import { calculateRecommendations } from './lib/quiz-logic'
import { QuizProgress } from './quiz-progress.component'
import { QuizNavigation, MinimalNavigation } from './quiz-navigation.component'
import {
    WelcomeStep,
    BodyAreaStep,
    ConcernsStep,
    LifestyleStep,
    EventStep,
    BudgetStep,
    LeadCaptureStep,
    ResultsStep,
    PackageBuilderStep,
    BookingStep,
} from './steps'

/**
 * Quiz state reducer
 */
function quizReducer(state: QuizState, action: QuizAction): QuizState {
    switch (action.type) {
        case 'SET_STEP':
            return { ...state, currentStep: action.step }

        case 'TOGGLE_BODY_AREA': {
            const areas = state.selectedBodyAreas.includes(action.area)
                ? state.selectedBodyAreas.filter((a) => a !== action.area)
                : [...state.selectedBodyAreas, action.area]
            return { ...state, selectedBodyAreas: areas }
        }

        case 'SET_FACE_CONCERNS':
            return { ...state, faceConcerns: action.concerns }

        case 'SET_BREAST_CONCERNS':
            return { ...state, breastConcerns: action.concerns }

        case 'SET_BODY_CONCERNS':
            return { ...state, bodyConcerns: action.concerns }

        case 'SET_RECOVERY_TIME':
            return { ...state, recoveryTime: action.time }

        case 'SET_LIFE_EVENT':
            return { ...state, lifeEvent: action.event }

        case 'SET_BUDGET_RANGE':
            return { ...state, budgetRange: action.range }

        case 'SET_LEAD_DATA':
            return { ...state, leadData: action.data, isLeadCaptured: true }

        case 'SET_RECOMMENDATIONS':
            return { ...state, recommendedProcedures: action.recommendations }

        case 'TOGGLE_PACKAGE_PROCEDURE': {
            const procedures = state.selectedPackage.includes(
                action.procedureId
            )
                ? state.selectedPackage.filter((p) => p !== action.procedureId)
                : [...state.selectedPackage, action.procedureId]
            return { ...state, selectedPackage: procedures }
        }

        case 'RESET':
            return initialQuizState

        default:
            return state
    }
}

export interface QuizContainerProps {
    /** Additional class names */
    readonly className?: string
}

/**
 * QuizContainer - Main quiz orchestration component
 */
export function QuizContainer({ className }: QuizContainerProps) {
    const [state, dispatch] = useReducer(quizReducer, initialQuizState)
    const [submitError, setSubmitError] = useState<string | undefined>()
    const { track } = useAnalyticsEvent()
    const stepRef = useRef(state.currentStep)

    // Form submission hook
    const { submit, isSubmitting } = useContactFormSubmission({
        source: CONTACT_SOURCES.QUIZ,
        enableAnalytics: true,
        analyticsFormName: 'procedure-quiz',
    })

    // Keep stepRef in sync for the beforeunload handler
    useEffect(() => {
        stepRef.current = state.currentStep
    }, [state.currentStep])

    // Track quiz abandonment on page unload (mid-quiz only)
    useEffect(() => {
        const handleBeforeUnload = () => {
            const step = stepRef.current
            const terminalSteps: QuizStep[] = [
                'welcome',
                'results',
                'package-builder',
                'booking',
            ]
            if (!terminalSteps.includes(step)) {
                // Use trackEvent directly with transport_type beacon for reliability during unload
                trackEvent('quiz_abandoned', {
                    quiz_name: 'procedure-finder',
                    last_step: step,
                    transport_type: 'beacon',
                })
            }
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        return () =>
            window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [])

    // Navigation handlers
    const goToStep = useCallback((step: QuizStep) => {
        dispatch({ type: 'SET_STEP', step })
    }, [])

    const goNext = useCallback(() => {
        // Fire quiz_started when leaving welcome step
        if (state.currentStep === 'welcome') {
            track('quiz_started', { quiz_name: 'procedure-finder' })
        }

        const nextStep = getNextStep(state.currentStep, state)
        if (nextStep) {
            goToStep(nextStep)
        }
    }, [state, track, goToStep])

    const goBack = useCallback(() => {
        const prevStep = getPreviousStep(state.currentStep, state)
        if (prevStep) {
            goToStep(prevStep)
        }
    }, [state, goToStep])

    // Step-specific handlers
    const handleBodyAreaToggle = useCallback((area: BodyArea) => {
        dispatch({ type: 'TOGGLE_BODY_AREA', area })
    }, [])

    const handleConcernToggle = useCallback(
        (concern: Concern) => {
            // Determine which concern list to update based on current step
            if (state.currentStep === 'face-concerns') {
                const concerns = state.faceConcerns.includes(
                    concern as FaceConcern
                )
                    ? state.faceConcerns.filter((c) => c !== concern)
                    : [concern as FaceConcern] // Single select for face
                dispatch({ type: 'SET_FACE_CONCERNS', concerns })
            } else if (state.currentStep === 'breast-concerns') {
                const concerns = state.breastConcerns.includes(
                    concern as BreastConcern
                )
                    ? state.breastConcerns.filter((c) => c !== concern)
                    : [...state.breastConcerns, concern as BreastConcern]
                dispatch({ type: 'SET_BREAST_CONCERNS', concerns })
            } else if (state.currentStep === 'body-concerns') {
                const concerns = state.bodyConcerns.includes(
                    concern as BodyConcern
                )
                    ? state.bodyConcerns.filter((c) => c !== concern)
                    : [...state.bodyConcerns, concern as BodyConcern]
                dispatch({ type: 'SET_BODY_CONCERNS', concerns })
            }
        },
        [
            state.currentStep,
            state.faceConcerns,
            state.breastConcerns,
            state.bodyConcerns,
        ]
    )

    const handleRecoveryTime = useCallback((time: RecoveryTime) => {
        dispatch({ type: 'SET_RECOVERY_TIME', time })
    }, [])

    const handleLifeEvent = useCallback((event: LifeEvent) => {
        dispatch({ type: 'SET_LIFE_EVENT', event })
    }, [])

    const handleBudgetRange = useCallback((range: BudgetRange) => {
        dispatch({ type: 'SET_BUDGET_RANGE', range })
    }, [])

    const handleLeadSubmit = useCallback(
        async (data: QuizLeadData) => {
            setSubmitError(undefined)

            // Calculate recommendations before submitting
            const recommendations = calculateRecommendations(state)
            dispatch({ type: 'SET_RECOMMENDATIONS', recommendations })

            // Initialize selected package with primary recommendation
            const primary = recommendations.find((r) => r.isPrimary)
            if (primary) {
                dispatch({
                    type: 'TOGGLE_PACKAGE_PROCEDURE',
                    procedureId: primary.procedureId,
                })
            }

            // Submit lead data
            const success = await submit({
                name: `${data.firstName} ${data.lastName}`,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone,
                subject: 'Procedure Quiz Lead',
                message: `Quiz completed. Recommended: ${recommendations
                    .filter((r) => r.confidence !== 'low')
                    .map((r) => r.procedureId)
                    .join(', ')}`,
            })

            if (success) {
                dispatch({ type: 'SET_LEAD_DATA', data })
                track('quiz_completed', {
                    quiz_name: 'procedure-finder',
                    primary_recommendation: primary?.procedureId,
                })
                goToStep('results')
            } else {
                setSubmitError(
                    'We could not submit your information right now. Please check your connection and try again, or call us directly.'
                )
            }
        },
        [state, submit, goToStep]
    )

    const handlePackageToggle = useCallback((procedureId: ProcedureId) => {
        dispatch({ type: 'TOGGLE_PACKAGE_PROCEDURE', procedureId })
    }, [])

    // Determine if next button should be enabled
    const canProceed = useCallback((): boolean => {
        switch (state.currentStep) {
            case 'body-area':
                return state.selectedBodyAreas.length > 0
            case 'face-concerns':
                return state.faceConcerns.length > 0
            case 'breast-concerns':
                return state.breastConcerns.length > 0
            case 'body-concerns':
                return state.bodyConcerns.length > 0
            case 'lifestyle':
                return state.recoveryTime !== null
            case 'event':
                return state.lifeEvent !== null
            case 'budget':
                return state.budgetRange !== null
            default:
                return true
        }
    }, [state])

    // Calculate progress
    const totalSteps = calculateTotalSteps(state)
    const currentStepNumber = getCurrentStepNumber(state)

    // Should show navigation
    const showNavigation = ![
        'welcome',
        'lead-capture',
        'results',
        'booking',
    ].includes(state.currentStep)

    // Render current step
    const renderStep = () => {
        switch (state.currentStep) {
            case 'welcome':
                return <WelcomeStep onStart={goNext} />

            case 'body-area':
                return (
                    <BodyAreaStep
                        selectedAreas={state.selectedBodyAreas}
                        onToggleArea={handleBodyAreaToggle}
                    />
                )

            case 'face-concerns':
                return (
                    <ConcernsStep
                        bodyArea='face'
                        selectedConcerns={state.faceConcerns}
                        onToggleConcern={handleConcernToggle}
                    />
                )

            case 'breast-concerns':
                return (
                    <ConcernsStep
                        bodyArea='breast'
                        selectedConcerns={state.breastConcerns}
                        onToggleConcern={handleConcernToggle}
                    />
                )

            case 'body-concerns':
                return (
                    <ConcernsStep
                        bodyArea='body'
                        selectedConcerns={state.bodyConcerns}
                        onToggleConcern={handleConcernToggle}
                    />
                )

            case 'lifestyle':
                return (
                    <LifestyleStep
                        value={state.recoveryTime}
                        onChange={handleRecoveryTime}
                    />
                )

            case 'event':
                return (
                    <EventStep
                        value={state.lifeEvent}
                        onChange={handleLifeEvent}
                    />
                )

            case 'budget':
                return (
                    <BudgetStep
                        value={state.budgetRange}
                        onChange={handleBudgetRange}
                    />
                )

            case 'lead-capture':
                return (
                    <LeadCaptureStep
                        onSubmit={handleLeadSubmit}
                        isSubmitting={isSubmitting}
                        error={submitError}
                    />
                )

            case 'results':
                return (
                    <ResultsStep
                        recommendations={state.recommendedProcedures}
                        onContinue={() => goToStep('package-builder')}
                    />
                )

            case 'package-builder':
                return (
                    <PackageBuilderStep
                        primaryRecommendation={state.recommendedProcedures.find(
                            (r) => r.isPrimary
                        )}
                        recommendations={state.recommendedProcedures}
                        selectedProcedures={state.selectedPackage}
                        onToggleProcedure={handlePackageToggle}
                        onContinue={() => goToStep('booking')}
                        onSkip={() => goToStep('booking')}
                    />
                )

            case 'booking':
                return (
                    <BookingStep
                        selectedProcedures={state.selectedPackage}
                        firstName={state.leadData?.firstName}
                        primaryRecommendation={state.recommendedProcedures.find(
                            (r) => r.isPrimary
                        )}
                    />
                )

            default:
                return null
        }
    }

    return (
        <div className={cn('relative min-h-[600px]', className)}>
            {/* Progress bar (not on welcome or final steps) */}
            {!['welcome', 'results', 'package-builder', 'booking'].includes(
                state.currentStep
            ) && (
                <div className='mb-8'>
                    <QuizProgress
                        currentStep={currentStepNumber}
                        totalSteps={totalSteps}
                    />
                </div>
            )}

            {/* Back button for certain steps */}
            {['lead-capture'].includes(state.currentStep) && (
                <MinimalNavigation onBack={goBack} className='mb-6' />
            )}

            {/* Step content */}
            <AnimatePresence mode='wait'>
                <motion.div
                    key={state.currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {renderStep()}
                </motion.div>
            </AnimatePresence>

            {/* Navigation buttons */}
            {showNavigation && (
                <div className='mt-8'>
                    <QuizNavigation
                        showBack={state.currentStep !== 'body-area'}
                        showNext
                        onBack={goBack}
                        onNext={goNext}
                        nextDisabled={!canProceed()}
                        nextText={
                            state.currentStep === 'budget'
                                ? 'See My Results'
                                : 'Continue'
                        }
                    />
                </div>
            )}
        </div>
    )
}

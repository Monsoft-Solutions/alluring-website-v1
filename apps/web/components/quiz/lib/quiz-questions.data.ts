/**
 * Quiz Questions Data
 *
 * Question definitions with options for each quiz step.
 * Includes branching logic configuration.
 *
 * @module components/quiz/lib/quiz-questions.data
 */

import type {
    BodyArea,
    BodyConcern,
    BreastConcern,
    BudgetRange,
    FaceConcern,
    LifeEvent,
    QuizOption,
    RecoveryTime,
} from './quiz-types'

/**
 * Body area selection options
 */
export const BODY_AREA_OPTIONS: readonly QuizOption<BodyArea>[] = [
    {
        value: 'face',
        label: 'Face',
        description: 'Eyelids, skin tightening, rejuvenation',
        icon: 'face',
    },
    {
        value: 'breast',
        label: 'Breast',
        description: 'Size, shape, lift, or reduction',
        icon: 'breast',
    },
    {
        value: 'body',
        label: 'Body',
        description: 'Contouring, tummy, curves',
        icon: 'body',
    },
] as const

/**
 * Face concern options
 */
export const FACE_CONCERN_OPTIONS: readonly QuizOption<FaceConcern>[] = [
    {
        value: 'drooping-eyelids',
        label: 'Drooping or Heavy Eyelids',
        description: 'Upper or lower eyelid concerns',
    },
    {
        value: 'sagging-skin',
        label: 'Sagging Skin, Jowls, or Neck',
        description: 'Loss of facial definition and firmness',
    },
    {
        value: 'both-face',
        label: 'Both Areas',
        description: 'Comprehensive facial rejuvenation',
    },
] as const

/**
 * Breast concern options
 */
export const BREAST_CONCERN_OPTIONS: readonly QuizOption<BreastConcern>[] = [
    {
        value: 'want-larger',
        label: 'I Want Them Larger',
        description: 'Increase size and fullness',
    },
    {
        value: 'lost-shape',
        label: "They've Lost Shape or Firmness",
        description: 'Restore youthful position and shape',
    },
    {
        value: 'too-large',
        label: "They're Too Large",
        description: 'Reduce size and relieve discomfort',
    },
    {
        value: 'multiple-breast',
        label: 'Multiple Concerns',
        description: 'Combination of size and shape goals',
    },
] as const

/**
 * Body concern options
 */
export const BODY_CONCERN_OPTIONS: readonly QuizOption<BodyConcern>[] = [
    {
        value: 'stubborn-fat',
        label: 'Remove Stubborn Fat',
        description: "Fat that won't go away with diet and exercise",
    },
    {
        value: 'flat-tummy',
        label: 'Flatten My Tummy',
        description: 'Tighten loose skin and muscles',
    },
    {
        value: 'enhance-curves',
        label: 'Enhance My Curves',
        description: 'Add volume to hips and buttocks',
    },
    {
        value: 'post-pregnancy',
        label: 'Post-Pregnancy Restoration',
        description: 'Restore your pre-baby body',
    },
    {
        value: 'multiple-body',
        label: 'Multiple Areas',
        description: 'Comprehensive body transformation',
    },
] as const

/**
 * Recovery time options
 */
export const RECOVERY_TIME_OPTIONS: readonly QuizOption<RecoveryTime>[] = [
    {
        value: '1-week',
        label: 'About 1 Week',
        description: 'Minimal downtime needed',
    },
    {
        value: '2-weeks',
        label: 'About 2 Weeks',
        description: 'Comfortable recovery period',
    },
    {
        value: '3-plus-weeks',
        label: '3+ Weeks',
        description: 'Flexible with recovery time',
    },
] as const

/**
 * Life event options
 */
export const LIFE_EVENT_OPTIONS: readonly QuizOption<LifeEvent>[] = [
    {
        value: 'wedding',
        label: 'Wedding',
        description: 'Looking stunning for your special day',
    },
    {
        value: 'vacation',
        label: 'Vacation',
        description: 'Beach-ready confidence',
    },
    {
        value: 'reunion',
        label: 'Reunion',
        description: 'Making a memorable impression',
    },
    {
        value: 'just-for-me',
        label: 'Just for Me',
        description: 'Self-investment in your confidence',
    },
] as const

/**
 * Budget range options (monthly payment comfort)
 */
export const BUDGET_RANGE_OPTIONS: readonly QuizOption<BudgetRange>[] = [
    {
        value: 'low',
        label: '$50-100/mo',
        description: 'Budget-friendly financing',
    },
    {
        value: 'medium',
        label: '$100-200/mo',
        description: 'Moderate monthly investment',
    },
    {
        value: 'high',
        label: '$200-350/mo',
        description: 'Comfortable monthly payment',
    },
    {
        value: 'premium',
        label: '$350+/mo',
        description: 'Premium procedures & combinations',
    },
] as const

/**
 * Question content for each step
 */
export const QUIZ_QUESTIONS = {
    welcome: {
        title: 'Discover Your Perfect Transformation',
        subtitle:
            "Answer a few questions and we'll recommend the ideal procedure for your goals",
        ctaText: 'Start Your Journey',
    },
    bodyArea: {
        title: 'What Areas Would You Like to Improve?',
        subtitle: 'Select all that apply',
    },
    faceConcerns: {
        title: 'What Concerns You Most About Your Face?',
        subtitle: 'Select your primary concern',
    },
    breastConcerns: {
        title: 'What Would You Like to Change?',
        subtitle: 'Tell us about your breast-related goals',
    },
    bodyConcerns: {
        title: 'What Are Your Body Goals?',
        subtitle: 'Select the areas you want to transform',
    },
    lifestyle: {
        title: 'How Much Recovery Time Can You Comfortably Take?',
        subtitle: 'This helps us recommend procedures that fit your lifestyle',
    },
    event: {
        title: "Is There a Special Event You're Preparing For?",
        subtitle: 'Optional - helps us understand your timeline',
    },
    budget: {
        title: 'What Monthly Payment Feels Comfortable?',
        subtitle:
            'We offer flexible financing through Cherry, CareCredit & United Credit',
    },
    leadCapture: {
        title: 'Your Personalized Plan Is Ready!',
        subtitle:
            'Enter your details to see your custom procedure recommendations',
    },
    results: {
        title: 'Your Recommended Procedure',
        subtitle: 'Based on your goals, we think this is perfect for you',
    },
    packageBuilder: {
        title: 'Enhance Your Results',
        subtitle:
            'Consider these complementary procedures for optimal transformation',
    },
    confirmation: {
        title: 'Thank You!',
        subtitle: 'Your personalized consultation request has been received',
        nextSteps: [
            'A consultation coordinator will call you within 24 hours',
            'Check your email for a confirmation with your recommended procedures',
            "Prepare any questions you'd like to ask during your consultation",
        ],
    },
} as const

/**
 * Social proof messages for results
 */
export const SOCIAL_PROOF_MESSAGES = {
    'breast-augmentation': '92% of similar patients loved their results',
    'breast-lift': 'Most popular among women 35-50',
    'breast-reduction': '98% report improved comfort and confidence',
    liposuction: '5,000+ successful procedures performed',
    bbl: 'Our most requested body procedure',
    'tummy-tuck': 'Perfect for post-pregnancy restoration',
    'mommy-makeover': '95% of moms recommend this combination',
    facelift: 'Average age of patients: 52 years',
    blepharoplasty: 'Quick recovery, dramatic results',
} as const

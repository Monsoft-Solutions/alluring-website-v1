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
        description: 'Treat several areas in one surgery',
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
 * Budget range options: how big a change, never a dollar or payment figure,
 * "affordable" or "all-inclusive" (claims canon D6, §10)
 */
export const BUDGET_RANGE_OPTIONS: readonly QuizOption<BudgetRange>[] = [
    {
        value: 'low',
        label: 'One focused change',
        description: 'A single, targeted procedure',
    },
    {
        value: 'medium',
        label: 'A noticeable change',
        description: 'One procedure, or two combined',
    },
    {
        value: 'high',
        label: 'A bigger change',
        description: 'Two or more areas in one plan',
    },
    {
        value: 'premium',
        label: 'Several changes at once',
        description: 'Several procedures together',
    },
] as const

/**
 * Question content for each step
 */
export const QUIZ_QUESTIONS = {
    welcome: {
        title: 'Find the Procedure That Fits Your Goals',
        subtitle:
            "Answer a few questions and we'll suggest procedures to ask about at your consultation",
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
        title: 'How Big a Change Do You Have in Mind?',
        subtitle: 'Your surgeon confirms your price at consultation',
    },
    leadCapture: {
        title: 'Your Personalized Plan Is Ready!',
        subtitle:
            'Enter your details to see your custom procedure recommendations',
    },
    results: {
        title: 'Your Recommended Procedure',
        subtitle:
            'Based on your answers, this may suit your goals. Your surgeon decides at consultation.',
    },
    packageBuilder: {
        title: 'Enhance Your Results',
        subtitle: 'Procedures that are often combined with this one',
    },
    confirmation: {
        title: 'Thank You!',
        subtitle: 'Your personalized consultation request has been received',
        nextSteps: [
            'A patient coordinator will text you to book your consultation',
            'Check your email for a confirmation',
            "Prepare any questions you'd like to ask during your consultation",
        ],
    },
} as const

/**
 * One line under each result card. No figures: the percentages, patient
 * counts and ages these used to quote had no source (#309).
 */
export const SOCIAL_PROOF_MESSAGES = {
    'breast-augmentation': 'Saline or silicone implants, sized to your frame',
    'breast-lift': 'Lifts and reshapes without adding size',
    'breast-reduction': 'Smaller, lighter breasts in proportion to your frame',
    liposuction: 'Lipo 360 treats your whole midsection in one surgery',
    bbl: 'Fat from your midsection, moved to shape your buttocks',
    'tummy-tuck': 'Often chosen after pregnancy',
    'mommy-makeover': 'A tummy tuck and breast surgery, planned as one surgery',
    facelift: 'Face and neck lifted together in one surgery',
    blepharoplasty: 'Most people are back at work in 7 to 10 days',
} as const

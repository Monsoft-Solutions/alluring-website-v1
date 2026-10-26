/**
 * Financing Page Data
 *
 * All content and configuration for the financing page.
 * Includes hero section, financing partners, how it works steps,
 * procedures available for financing, and CTA content.
 *
 * Note: Icon names are strings to allow SSR pages to pass data
 * to client components without serialization issues.
 */
import { FINANCING_SENTENCE_LONG } from '@workspace/shared/claims/financing'

import { getPhoneLink, siteConfig } from '@/lib/data/site-config'
import { KARLINSKY_NAME } from '@/lib/data/surgeons/karlinsky-credentials.constant'
import type {
    FinancingPageData,
    FinancingPartner,
    FinancingProcedureCategory,
    FinancingSeoData,
    FinancingStep,
    FinancingTrustIndicator,
} from '@/lib/types/financing.type'

/**
 * Hero trust indicators. The claims canon (§6, D6, #354) lets financing copy
 * name the partners and nothing else: no rate, approval speed, credit score,
 * limit or term, so the indicators say what is true of every partner.
 */
const heroTrustIndicators: FinancingTrustIndicator[] = [
    {
        icon: 'Shield',
        text: 'Three',
        label: 'Financing partners',
    },
    {
        icon: 'Zap',
        text: 'Online',
        label: 'Application',
    },
    {
        icon: 'Percent',
        text: 'Lender',
        label: 'Sets the terms',
    },
]

/** What every partner card says: who sets the terms, and how to apply. */
const LENDER_TERMS = 'Approval and terms are set by the lender.'

/**
 * Financing partners. Each is named with what it is; its rates, limits,
 * approval speed and credit requirements are the lender's to state.
 */
const financingPartners: FinancingPartner[] = [
    {
        id: 'cherry',
        name: 'Cherry',
        tagline: 'Payment plans for aesthetic procedures',
        description: `Cherry offers payment plans for aesthetic procedures. ${LENDER_TERMS}`,
        benefits: [
            'Apply online from your phone',
            'Made for aesthetic procedures',
            LENDER_TERMS,
        ],
        highlights: [
            { label: 'Apply', value: 'Online', icon: 'CheckCircle' },
            { label: 'Terms', value: 'By Cherry', icon: 'Zap' },
        ],
        logoUrl: '/images/financing/cherry-logo.svg',
        accentColor: 'rose',
    },
    {
        id: 'carecredit',
        name: 'CareCredit',
        tagline: 'A healthcare credit card',
        description: `CareCredit is a credit card for medical and aesthetic care. ${LENDER_TERMS}`,
        benefits: [
            'A credit card for healthcare costs',
            'Apply online',
            LENDER_TERMS,
        ],
        highlights: [
            { label: 'Type', value: 'Credit Card', icon: 'CreditCard' },
            { label: 'Terms', value: 'By CareCredit', icon: 'BadgeCheck' },
        ],
        logoUrl: '/images/financing/carecredit-logo.png',
        accentColor: 'blue',
    },
    {
        id: 'united-credit',
        name: 'United Credit',
        tagline: 'Personal loans for medical procedures',
        description: `United Credit offers loans for medical and cosmetic procedures. ${LENDER_TERMS}`,
        benefits: [
            'A loan for your procedure',
            'Simple application process',
            LENDER_TERMS,
        ],
        highlights: [
            { label: 'Type', value: 'Loan', icon: 'Wallet' },
            {
                label: 'Terms',
                value: 'By United Credit',
                icon: 'CalendarCheck',
            },
        ],
        logoUrl: '/images/financing/united-credit-logo.png',
        accentColor: 'emerald',
    },
]

/**
 * How it works steps
 */
const howItWorksSteps: FinancingStep[] = [
    {
        step: 1,
        title: 'Schedule Your Consultation',
        description: `Meet ${KARLINSKY_NAME} to discuss your goals and receive a personalized treatment plan, with your price confirmed at consultation.`,
        icon: 'UserCheck',
    },
    {
        step: 2,
        title: 'Choose Your Plan',
        description: FINANCING_SENTENCE_LONG,
        icon: 'FileCheck',
    },
    {
        step: 3,
        title: 'Apply',
        description: `Apply with the lender you choose, online. ${LENDER_TERMS}`,
        icon: 'Timer',
        duration: 'Online',
    },
    {
        step: 4,
        title: 'Begin Your Transformation',
        description:
            'With financing in place, you book your surgery date and focus on your results.',
        icon: 'Sparkles',
        duration: 'Your Timeline',
    },
]

/**
 * Procedure categories available for financing
 */
const procedureCategories: FinancingProcedureCategory[] = [
    {
        id: 'face',
        name: 'Facial Procedures',
        icon: 'Smile',
        procedures: [
            { name: 'Facelift', slug: 'facelift-miami' },
            { name: 'Blepharoplasty', slug: 'blepharoplasty-miami' },
        ],
    },
    {
        id: 'body',
        name: 'Body Procedures',
        icon: 'Heart',
        procedures: [
            {
                name: 'Brazilian Butt Lift',
                slug: 'brazilian-butt-lift-bbl-miami',
            },
            { name: 'Tummy Tuck', slug: 'tummy-tuck-miami' },
            { name: 'Liposuction', slug: 'liposuction-miami' },
            { name: 'Mommy Makeover', slug: 'mommy-makeover-miami' },
        ],
    },
    {
        id: 'breast',
        name: 'Breast Procedures',
        icon: 'Sparkles',
        procedures: [
            { name: 'Breast Augmentation', slug: 'breast-augmentation-miami' },
            { name: 'Breast Lift', slug: 'breast-lift-miami' },
            { name: 'Breast Reduction', slug: 'breast-reduction-miami' },
        ],
    },
]

/**
 * Complete financing page data
 */
export const financingPageData: FinancingPageData = {
    hero: {
        badge: 'Financing',
        headline: 'Your Results, Your Timeline',
        subheadline: siteConfig.business.tagline,
        description: FINANCING_SENTENCE_LONG,
        trustIndicators: heroTrustIndicators,
        primaryCta: {
            text: 'Talk to a Specialist',
            href: getPhoneLink(),
        },
        secondaryCta: {
            text: 'View Procedures',
            href: '/procedures',
        },
        backgroundImage: `/images/hero-beautiful-latin-woman.jpg`,
    },
    partners: {
        badge: 'Our Partners',
        title: 'Our Financing Partners',
        description: FINANCING_SENTENCE_LONG,
        partners: financingPartners,
    },
    howItWorks: {
        badge: 'Simple Process',
        title: 'How Financing Works',
        description:
            'Apply with the lender you choose. Approval and terms are set by the lender.',
        steps: howItWorksSteps,
    },
    procedures: {
        badge: 'What You Can Finance',
        title: 'Procedures Available',
        description:
            'Financing is available for every cosmetic procedure we offer, for qualified applicants.',
        categories: procedureCategories,
    },
    cta: {
        eyebrow: 'Ready to Get Started?',
        heading: 'Speak with a Financing Specialist Today',
        description:
            'Our team can go through the financing options with you. Call for a free, no-obligation consultation.',
        primaryButton: {
            text: `Call ${siteConfig.contact.phoneDisplay}`,
            href: getPhoneLink(),
        },
        secondaryButton: {
            text: 'Request Consultation',
            href: '/contact-us',
        },
    },
}

/**
 * SEO metadata for financing page
 * Note: Title is set directly in the page component as "Plastic Surgery Financing Miami"
 * The global template will append "| Alluring Plastic Surgery"
 */
export const financingSeoData: FinancingSeoData = {
    title: 'Plastic Surgery Financing Miami',
    description: `Plastic surgery financing in Miami through Cherry, CareCredit and United Credit, for qualified applicants. Finance BBL, breast augmentation, tummy tuck & more. Call ${siteConfig.contact.phoneDisplay}.`,
    keywords: [
        'plastic surgery financing miami',
        'cosmetic surgery payment plans',
        'BBL financing miami',
        'breast augmentation financing',
        'tummy tuck payment plan',
        'mommy makeover financing',
        'CareCredit plastic surgery',
        'Cherry financing cosmetic surgery',
    ],
    canonical: '/plastic-surgery-financing-miami',
}

/**
 * Export individual sections for component use
 */
export const financingHeroData = financingPageData.hero
export const financingPartnersData = financingPageData.partners
export const financingHowItWorksData = financingPageData.howItWorks
export const financingProceduresData = financingPageData.procedures
export const financingCtaData = financingPageData.cta

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
import { getPhoneLink, siteConfig } from '@/lib/data/site-config'
import type {
    FinancingPageData,
    FinancingPartner,
    FinancingProcedureCategory,
    FinancingSeoData,
    FinancingStep,
    FinancingTrustIndicator,
} from '@/lib/types/financing.type'

/**
 * Hero trust indicators
 */
const heroTrustIndicators: FinancingTrustIndicator[] = [
    {
        icon: 'Percent',
        text: '0% APR',
        label: 'Available',
    },
    {
        icon: 'Zap',
        text: 'Seconds',
        label: 'Approval Time',
    },
    {
        icon: 'Shield',
        text: '520+',
        label: 'Credit Score',
    },
]

/**
 * Financing partners data
 */
const financingPartners: FinancingPartner[] = [
    {
        id: 'cherry',
        name: 'Cherry',
        tagline: 'Fast Approval, Flexible Terms',
        description:
            'Get approved in seconds with no impact to your credit score. Cherry offers transparent payment options designed for aesthetic procedures.',
        benefits: [
            'Approval in seconds with soft credit check',
            'High approval rates for scores 520+',
            'No impact on your credit score to apply',
            'Buy now, pay later up to $10,000',
        ],
        highlights: [
            { label: 'Min. Credit', value: '520', icon: 'CheckCircle' },
            { label: 'Approval', value: 'Instant', icon: 'Zap' },
            { label: 'Max Amount', value: '$10K', icon: 'Banknote' },
        ],
        accentColor: 'rose',
    },
    {
        id: 'carecredit',
        name: 'CareCredit',
        tagline: 'Healthcare-Focused Financing',
        description:
            'The healthcare credit card designed exclusively for medical and aesthetic procedures. Enjoy promotional financing and a dedicated line of credit.',
        benefits: [
            'Clear, flexible payment options',
            '0% APR promotional financing available',
            'Dedicated healthcare credit line',
            'Accepted at 250,000+ locations',
        ],
        highlights: [
            { label: 'APR', value: '0%*', icon: 'Percent' },
            { label: 'Type', value: 'Credit Line', icon: 'CreditCard' },
            { label: 'Network', value: '250K+', icon: 'BadgeCheck' },
        ],
        accentColor: 'blue',
    },
    {
        id: 'united-credit',
        name: 'United Credit',
        tagline: 'High Limits, No Penalties',
        description:
            'Access loans up to $25,000 with flexible payment terms. Pay off early without penalties and enjoy straightforward financing.',
        benefits: [
            'Flexible financing options up to $25,000',
            'No early payment penalties',
            'Potential for higher limits based on credit',
            'Simple application process',
        ],
        highlights: [
            { label: 'Max Loan', value: '$25K+', icon: 'Wallet' },
            { label: 'Early Payoff', value: 'No Fee', icon: 'CheckCircle' },
            { label: 'Terms', value: 'Flexible', icon: 'CalendarCheck' },
        ],
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
        description:
            'Meet with our board-certified surgeons to discuss your goals and receive a personalized treatment plan with transparent pricing.',
        icon: 'UserCheck',
        duration: '30-60 min',
    },
    {
        step: 2,
        title: 'Choose Your Plan',
        description:
            'Our financing specialists will help you explore options from Cherry, CareCredit, or United Credit to find the perfect fit for your budget.',
        icon: 'FileCheck',
        duration: '5-10 min',
    },
    {
        step: 3,
        title: 'Quick Approval',
        description:
            'Apply online in seconds with no impact to your credit. Most patients receive instant approval and can book their procedure immediately.',
        icon: 'Timer',
        duration: 'Seconds',
    },
    {
        step: 4,
        title: 'Begin Your Transformation',
        description:
            'With financing secured, focus on what matters—your results. Enjoy comfortable monthly payments while achieving the look you deserve.',
        icon: 'Sparkles',
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
            { name: 'Rhinoplasty', slug: 'rhinoplasty-miami' },
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
        badge: 'Flexible Payment Options',
        headline: 'Your Dream Results, Your Timeline',
        subheadline: 'Luxury Surgeries Made Affordable',
        description:
            "Don't let finances delay your transformation. Our flexible financing options make world-class cosmetic surgery accessible with affordable monthly payments and quick approvals.",
        trustIndicators: heroTrustIndicators,
        primaryCta: {
            text: 'Talk to a Specialist',
            href: getPhoneLink(),
        },
        secondaryCta: {
            text: 'View Procedures',
            href: '/procedures',
        },
        backgroundImage:
            'https://sarpxxbehh1ep7ka.public.blob.vercel-storage.com/images/alluring-financing-hero-bg.jpg',
    },
    partners: {
        badge: 'Our Partners',
        title: 'Trusted Financing Options',
        description:
            'We partner with industry-leading healthcare financing providers to offer you flexible, transparent payment plans tailored to your needs.',
        partners: financingPartners,
    },
    howItWorks: {
        badge: 'Simple Process',
        title: 'How Financing Works',
        description:
            'Getting approved is quick and easy. Most patients complete the entire process in under 15 minutes.',
        steps: howItWorksSteps,
    },
    procedures: {
        badge: 'What You Can Finance',
        title: 'Procedures Available',
        description:
            'Finance any of our cosmetic procedures with flexible monthly payments. Transform your look without the financial stress.',
        categories: procedureCategories,
    },
    cta: {
        eyebrow: 'Ready to Get Started?',
        heading: 'Speak with a Financing Specialist Today',
        description:
            'Our team is here to help you explore your options and find the perfect payment plan. Call now for a free, no-obligation consultation.',
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
 */
export const financingSeoData: FinancingSeoData = {
    title: 'Plastic Surgery Financing Miami | 0% APR Plans | Alluring Plastic Surgery',
    description:
        'Affordable plastic surgery financing in Miami. Get approved in seconds with 0% APR options. Finance BBL, breast augmentation, tummy tuck & more. Call (786) 305-8649.',
    keywords: [
        'plastic surgery financing miami',
        'cosmetic surgery payment plans',
        'BBL financing miami',
        '0% APR plastic surgery',
        'breast augmentation financing',
        'tummy tuck payment plan',
        'mommy makeover financing',
        'CareCredit plastic surgery',
        'Cherry financing cosmetic surgery',
        'affordable plastic surgery miami',
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

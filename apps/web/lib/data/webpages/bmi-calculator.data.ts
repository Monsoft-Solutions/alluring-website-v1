/**
 * BMI Calculator Page Data
 *
 * All content and configuration for the BMI calculator page.
 * Includes hero section, BMI categories, SEO data, and CTA content.
 *
 * Note: Icon names are strings to allow SSR pages to pass data
 * to client components without serialization issues.
 */
import { getPhoneLink, siteConfig } from '@/lib/data/site-config'

/**
 * BMI Category definition
 */
export type BmiCategory = {
    readonly id: string
    readonly label: string
    readonly range: string
    readonly minBmi: number
    readonly maxBmi: number | null
    readonly color: string
    readonly bgColor: string
    readonly borderColor: string
    readonly description: string
    readonly surgeryRecommendation: string
}

/**
 * BMI Hero Data
 */
export type BmiHeroData = {
    readonly badge: string
    readonly headline: string
    readonly subheadline: string
    readonly description: string
    readonly trustIndicators: Array<{
        readonly icon: string
        readonly text: string
        readonly label: string
    }>
    readonly primaryCta: {
        readonly text: string
        readonly href: string
    }
    readonly secondaryCta?: {
        readonly text: string
        readonly href: string
    }
}

/**
 * BMI Page Data
 */
export type BmiPageData = {
    readonly hero: BmiHeroData
    readonly categories: {
        readonly badge: string
        readonly title: string
        readonly description: string
        readonly items: BmiCategory[]
    }
    readonly cta: {
        readonly eyebrow: string
        readonly heading: string
        readonly description: string
        readonly primaryButton: {
            readonly text: string
            readonly href: string
        }
        readonly secondaryButton?: {
            readonly text: string
            readonly href: string
        }
    }
}

/**
 * BMI SEO Data
 */
export type BmiSeoData = {
    readonly title: string
    readonly description: string
    readonly keywords: string[]
    readonly canonical: string
}

/**
 * Hero trust indicators
 */
const heroTrustIndicators = [
    {
        icon: 'Shield',
        text: 'Board-Certified',
        label: 'Surgeons',
    },
    {
        icon: 'Award',
        text: 'AAAASF',
        label: 'Accredited',
    },
    {
        icon: 'Heart',
        text: '5,000+',
        label: 'Patients',
    },
]

/**
 * BMI Categories Data
 *
 * Based on WHO BMI classification and cosmetic surgery industry standards.
 * Research sources:
 * - beautybydrcat.com/blog/what-is-the-bmi-requirement-for-plastic-surgery
 * - vadoplasticsurgery.com/blog/is-there-a-bmi-requirement-for-plastic-surgery
 * - careagaplasticsurgery.com/blog/does-your-bmi-affect-your-plastic-surgery-candidacy
 *
 * Key findings:
 * - Most surgeons require BMI of 30 or below
 * - Optimal surgical candidacy range: 18-32
 * - Tummy tuck & combo procedures: BMI 32 or less recommended
 * - Liposuction: BMI under 30 preferred
 * - BMI 35+: Increased complication risk
 */
const bmiCategories: BmiCategory[] = [
    {
        id: 'underweight',
        label: 'Underweight',
        range: 'Below 18.5',
        minBmi: 0,
        maxBmi: 18.5,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        description:
            'A BMI below 18.5 may indicate insufficient body fat for certain procedures like BBL, which requires adequate fat for transfer. Nutritional optimization may be recommended before surgery.',
        surgeryRecommendation:
            'Consultation recommended. Breast augmentation and facial procedures are often available. BBL may require weight gain for adequate donor fat.',
    },
    {
        id: 'normal',
        label: 'Normal Weight',
        range: '18.5 - 24.9',
        minBmi: 18.5,
        maxBmi: 25,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        description:
            'A BMI between 18.5 and 24.9 is considered optimal for most cosmetic procedures. This range presents the lowest surgical risk and typically yields the best aesthetic outcomes.',
        surgeryRecommendation:
            'Ideal candidate for all procedures including BBL, breast augmentation, tummy tuck, liposuction, mommy makeover, and facial surgeries.',
    },
    {
        id: 'overweight',
        label: 'Overweight',
        range: '25 - 29.9',
        minBmi: 25,
        maxBmi: 30,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        description:
            'A BMI between 25 and 29.9 falls within the optimal surgical candidacy range (18-32). Most plastic surgeons safely perform procedures in this range with excellent results.',
        surgeryRecommendation:
            'Excellent candidate for most procedures. Liposuction, tummy tuck, breast surgeries, BBL, and combo procedures are commonly performed safely.',
    },
    {
        id: 'obese-1',
        label: 'Obese Class I',
        range: '30 - 34.9',
        minBmi: 30,
        maxBmi: 35,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        description:
            'A BMI between 30 and 34.9 is at the upper limit of surgical candidacy. Many surgeons will operate in this range with additional health screening. For combo procedures and tummy tucks, a BMI of 32 or less is often preferred.',
        surgeryRecommendation:
            'Many procedures available with comprehensive health evaluation. Hospital setting may be recommended for enhanced safety. Weight loss before surgery may improve outcomes.',
    },
    {
        id: 'obese-2-plus',
        label: 'Obese Class II+',
        range: '35 and above',
        minBmi: 35,
        maxBmi: null,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        description:
            'A BMI of 35 or higher significantly increases surgical risks including anesthesia complications, delayed healing, infection, and poor scarring. Most surgeons have BMI limits of 35-40 for elective procedures.',
        surgeryRecommendation:
            'Supportive consultation available to discuss weight management strategies and create a roadmap to surgical candidacy. Some procedures may be possible in a hospital setting.',
    },
]

/**
 * Complete BMI page data
 */
export const bmiPageData: BmiPageData = {
    hero: {
        badge: 'Free Health Tool',
        headline: 'BMI Calculator for Plastic Surgery',
        subheadline: 'Know Your Candidacy',
        description:
            'Body Mass Index (BMI) is an important factor in determining your candidacy for cosmetic procedures. Use our free calculator to understand how your BMI may affect your surgical options and safety.',
        trustIndicators: heroTrustIndicators,
        primaryCta: {
            text: 'Book Consultation',
            href: '/contact-us',
        },
        secondaryCta: {
            text: 'View Procedures',
            href: '/procedures',
        },
    },
    categories: {
        badge: 'BMI Ranges',
        title: 'Understanding BMI Categories',
        description:
            'BMI is one of several factors we consider when evaluating surgical candidacy. Each category has different implications for cosmetic procedures.',
        items: bmiCategories,
    },
    cta: {
        eyebrow: 'Ready for Your Transformation?',
        heading: 'Schedule Your Personalized Consultation',
        description:
            'BMI is just one factor we consider. Our board-certified surgeons will evaluate your complete health profile to create a safe, personalized treatment plan. Call now for a confidential consultation.',
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
 * SEO metadata for BMI calculator page
 */
export const bmiSeoData: BmiSeoData = {
    title: 'BMI Calculator for Plastic Surgery',
    description: `Free BMI calculator for cosmetic surgery candidacy. Understand how your Body Mass Index affects eligibility for BBL, tummy tuck, breast surgery & more. Board-certified surgeons in Miami. Call ${siteConfig.contact.phoneDisplay}.`,
    keywords: [
        'BMI calculator plastic surgery',
        'BMI for cosmetic surgery miami',
        'ideal BMI for plastic surgery',
        'BMI requirements tummy tuck',
        'BMI for BBL surgery',
        'body mass index calculator',
        'plastic surgery candidacy BMI',
        'cosmetic surgery BMI requirements',
        'BBL BMI requirements miami',
        'tummy tuck BMI calculator',
    ],
    canonical: '/bmi-calculator',
}

/**
 * Export individual sections for component use
 */
export const bmiHeroData = bmiPageData.hero
export const bmiCategoriesData = bmiPageData.categories
export const bmiCtaData = bmiPageData.cta
export { bmiCategories }

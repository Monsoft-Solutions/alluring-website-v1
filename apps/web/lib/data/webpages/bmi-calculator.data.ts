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
import { KARLINSKY_NAME } from '@/lib/data/surgeons/karlinsky-credentials.constant'

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
 * Hero trust indicators: verified facts only (claims canon §2–§4, #354).
 * The retired "AAAASF Accredited" and "5,000+ Patients" badges are not
 * replaced.
 */
const heroTrustIndicators = [
    {
        icon: 'Shield',
        text: 'Since 2008',
        label: 'Certified by the American Board of Surgery',
    },
    {
        icon: 'Award',
        text: 'FACS',
        label: 'American College of Surgeons',
    },
    {
        icon: 'Heart',
        text: 'One',
        label: 'Surgeon for every procedure',
    },
]

/**
 * BMI Categories Data
 *
 * The ranges are the WHO BMI classification. No BMI cutoff is quoted: the
 * only figure is the facts file's (Winocour 2015, tummy tuck risk rises
 * with a BMI of 30 or more), and every answer ends with the surgeon
 * deciding at consultation (claims canon §7, #354).
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
            "A BMI below 18.5 is in the underweight range. A BBL needs enough fat to transfer, so a low BMI can mean there isn't enough; your surgeon decides at consultation.",
        surgeryRecommendation:
            'Consultation recommended. Some procedures, such as breast augmentation or facial surgery, may still be possible, and a BBL may need weight gain for enough donor fat. Your surgeon decides at consultation.',
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
            'A BMI between 18.5 and 24.9 is in the healthy weight range.',
        surgeryRecommendation:
            "A BMI in this range usually doesn't limit which procedures you can consider, including BBL, breast augmentation, tummy tuck, liposuction, mommy makeover and facial surgery. Your surgeon decides at consultation.",
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
            'A BMI between 25 and 29.9 is in the overweight range. Many people in this range are candidates for surgery; your surgeon decides at consultation.',
        surgeryRecommendation:
            'Often a candidate for many procedures, including liposuction, tummy tuck, breast surgery and BBL. Your surgeon decides at consultation.',
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
            'A BMI between 30 and 34.9 is in the obese range, and additional health screening is usually part of the evaluation. For a tummy tuck, one large study linked a BMI of 30 or more to a higher risk of major complications (Winocour and colleagues, Plastic and Reconstructive Surgery, 2015). It is a risk factor, not a cutoff; your surgeon decides at consultation.',
        surgeryRecommendation:
            'Many procedures are available with a full health evaluation, and losing weight before surgery may improve outcomes. Your surgeon decides at consultation.',
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
            'A higher BMI raises the risk of complications after surgery. For a tummy tuck, one large study found higher risk from a BMI of 30 (Winocour and colleagues, 2015). Your surgeon decides at consultation.',
        surgeryRecommendation:
            'A consultation can help you plan weight management and a path to surgery. Your surgeon decides at consultation.',
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
            'BMI is just one factor we consider. Dr. Karlinsky reviews your complete health profile at consultation and decides with you whether surgery is right for you. Call now for a confidential consultation.',
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
    description: `Free BMI calculator for cosmetic surgery candidacy. Understand how your Body Mass Index affects eligibility for BBL, tummy tuck, breast surgery & more. ${KARLINSKY_NAME}, in Miami. Call ${siteConfig.contact.phoneDisplay}.`,
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

import type { SitePage } from '../types/site-pages.type'

/**
 * Procedure pages
 *
 * Central source of truth for all cosmetic procedure pages.
 */
export const PROCEDURE_PAGES: SitePage[] = [
    {
        url: '/procedures/breast-augmentation-miami',
        title: 'Breast Augmentation Miami',
        description: 'Enhance your natural shape with custom breast implants',
        type: 'procedure',
        keywords: [
            'breast augmentation',
            'breast implants',
            'breast enhancement',
            'implants',
            'augmentation',
        ],
    },
    {
        url: '/procedures/breast-lift-miami',
        title: 'Breast Lift Miami',
        description: 'Restore youthful breast shape and position',
        type: 'procedure',
        keywords: ['breast lift', 'mastopexy', 'sagging breasts', 'lift'],
    },
    {
        url: '/procedures/breast-reduction-miami',
        title: 'Breast Reduction Miami',
        description: 'Achieve comfort and proportion with breast reduction',
        type: 'procedure',
        keywords: [
            'breast reduction',
            'reduction mammaplasty',
            'large breasts',
            'reduction',
        ],
    },
    {
        url: '/procedures/liposuction-miami',
        title: 'Liposuction Miami',
        description: 'Remove stubborn fat deposits with precision liposuction',
        type: 'procedure',
        keywords: ['liposuction', 'lipo', 'fat removal', 'body contouring'],
    },
    {
        url: '/procedures/brazilian-butt-lift-bbl-miami',
        title: 'Brazilian Butt Lift (BBL) Miami',
        description: 'Enhance your curves with natural fat transfer',
        type: 'procedure',
        keywords: [
            'bbl',
            'brazilian butt lift',
            'butt lift',
            'fat transfer',
            'buttock augmentation',
        ],
    },
    {
        url: '/procedures/tummy-tuck-miami',
        title: 'Tummy Tuck Miami',
        description: 'Achieve a flatter, firmer abdomen',
        type: 'procedure',
        keywords: [
            'tummy tuck',
            'abdominoplasty',
            'abdominal surgery',
            'stomach surgery',
        ],
    },
    {
        url: '/procedures/mommy-makeover-miami',
        title: 'Mommy Makeover Miami',
        description: 'Comprehensive body restoration after pregnancy',
        type: 'procedure',
        keywords: [
            'mommy makeover',
            'post-pregnancy',
            'body restoration',
            'combination surgery',
        ],
    },
    {
        url: '/procedures/facelift-miami',
        title: 'Facelift Miami',
        description: 'Turn back the clock with facial rejuvenation',
        type: 'procedure',
        keywords: [
            'facelift',
            'rhytidectomy',
            'facial rejuvenation',
            'face surgery',
        ],
    },
    {
        url: '/procedures/blepharoplasty-miami',
        title: 'Blepharoplasty Miami',
        description: 'Refresh tired eyes with eyelid surgery',
        type: 'procedure',
        keywords: [
            'blepharoplasty',
            'eyelid surgery',
            'eye lift',
            'droopy eyelids',
        ],
    },
    {
        url: '/procedures/rhinoplasty-miami',
        title: 'Rhinoplasty Miami',
        description: 'Reshape and refine your nose for facial harmony',
        type: 'procedure',
        keywords: ['rhinoplasty', 'nose job', 'nose surgery', 'nose reshaping'],
    },
]

/**
 * Main website pages (non-procedure)
 *
 * Central source of truth for core marketing and informational pages.
 */
export const WEBSITE_PAGES: SitePage[] = [
    {
        url: '/procedures',
        title: 'All Procedures',
        description:
            'Browse our full range of cosmetic and plastic surgery procedures',
        type: 'page',
        keywords: ['procedures', 'services', 'treatments'],
    },
    {
        url: '/about',
        title: 'About Alluring Plastic Surgery',
        description: 'Learn about our surgeons and commitment to excellence',
        type: 'page',
        keywords: ['about', 'surgeons', 'team', 'clinic', 'experience'],
    },
    {
        url: '/plastic-surgery-financing-miami',
        title: 'Plastic Surgery Financing Miami',
        description: 'Flexible financing options for your procedure',
        type: 'page',
        keywords: ['financing', 'payment plans', 'cost', 'affordable', 'price'],
    },
    {
        url: '/gallery',
        title: 'Before & After Gallery',
        description: 'View real patient results from our procedures',
        type: 'gallery',
        keywords: ['gallery', 'before after', 'results', 'photos', 'pictures'],
    },
    {
        url: '/contact-us',
        title: 'Contact Us',
        description: 'Schedule your consultation today',
        type: 'page',
        keywords: [
            'contact',
            'consultation',
            'appointment',
            'schedule',
            'call',
        ],
    },
    {
        url: '/blog',
        title: 'Blog',
        description: 'Expert insights on plastic surgery',
        type: 'page',
        keywords: ['blog', 'articles', 'news', 'insights'],
    },
    {
        url: '/faq',
        title: 'Frequently Asked Questions',
        description: 'Find answers to common questions about our procedures',
        type: 'page',
        keywords: ['faq', 'questions', 'answers', 'recovery', 'cost'],
    },
    {
        url: '/miami-plastic-surgery-specials',
        title: 'Miami Plastic Surgery Specials',
        description: 'Check our latest promotions and special offers',
        type: 'page',
        keywords: ['specials', 'promotions', 'discounts', 'offers'],
    },
]

/**
 * Surgeon profiles
 */
export const SURGEON_PAGES: SitePage[] = [
    {
        url: '/dr-karlinsky',
        title: 'Dr. Victoria Karlinsky-Bellini',
        description: 'Board-certified cosmetic surgeon in Miami',
        type: 'surgeon',
        keywords: ['surgeon', 'dr karlinsky', 'female plastic surgeon'],
    },
    {
        url: '/dr-rita-shats',
        title: 'Dr. Rita Shats',
        description: 'Board-certified plastic surgeon',
        type: 'surgeon',
        keywords: ['surgeon', 'dr shats'],
    },
]

/**
 * Get all primary pages for indexing and linking
 */
export function getAllMainPages(): SitePage[] {
    return [...PROCEDURE_PAGES, ...WEBSITE_PAGES, ...SURGEON_PAGES]
}

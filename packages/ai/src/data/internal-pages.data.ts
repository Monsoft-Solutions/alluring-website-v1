/**
 * Internal Pages Data
 *
 * Static data for all internal website pages available for linking.
 * Used for context injection in content generation to enable natural internal linking.
 *
 * @module @workspace/ai/data/internal-pages
 */

/**
 * Internal page definition
 */
export type InternalPage = {
    /** URL path */
    url: string
    /** Page title */
    title: string
    /** Brief description */
    description: string
    /** Type of page */
    type: 'procedure' | 'blog' | 'page' | 'gallery'
    /** Keywords for matching */
    keywords: string[]
}

/**
 * Procedure pages
 */
export const PROCEDURE_PAGES: InternalPage[] = [
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
 * Website pages (non-procedure)
 */
export const WEBSITE_PAGES: InternalPage[] = [
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
]

/**
 * Get all internal pages
 */
export function getAllInternalPages(): InternalPage[] {
    return [...PROCEDURE_PAGES, ...WEBSITE_PAGES]
}

/**
 * Format internal pages for prompt context injection
 * This format is optimized for the AI to understand and use for linking
 */
export function getInternalPagesContext(): string {
    const procedureSection = PROCEDURE_PAGES.map(
        (p) =>
            `- [${p.title}](${p.url}) - ${p.description} | Keywords: ${p.keywords.join(', ')}`
    ).join('\n')

    const resourceSection = WEBSITE_PAGES.map(
        (p) =>
            `- [${p.title}](${p.url}) - ${p.description} | Keywords: ${p.keywords.join(', ')}`
    ).join('\n')

    return `## Available Internal Pages for Linking

### Procedures
${procedureSection}

### Resources
${resourceSection}

**Internal Linking Instructions:**
- Naturally link 3-5 of these pages throughout your content
- Use descriptive anchor text that flows naturally in the sentence
- Only link to pages that are genuinely relevant to the content
- Prefer procedure pages when discussing specific treatments
- Link to financing when discussing costs or affordability
- Link to gallery when mentioning results or outcomes`
}

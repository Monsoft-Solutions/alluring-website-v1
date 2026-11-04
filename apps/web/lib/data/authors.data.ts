/**
 * Authors Data
 *
 * Extended author information for E-E-A-T (Experience, Expertise, Authority, Trust)
 * signals. This data supplements database author records with credentials,
 * certifications, and professional affiliations.
 *
 * This helps LLMs verify expertise and improves SEO for medical content.
 */

export type AuthorCredentials = {
    title: string
    institution?: string
    year?: string | number
}

export type AuthorAffiliation = {
    organization: string
    role?: string
    url?: string
}

export type AuthorExtended = {
    /** Author slug for URL routing */
    slug: string
    /** Display name */
    name: string
    /** Professional title/role */
    jobTitle: string
    /** Short bio (1-2 sentences) */
    shortBio: string
    /** Full biography */
    fullBio: string
    /** Avatar/headshot URL */
    avatarUrl?: string
    /** Medical credentials and certifications */
    credentials: AuthorCredentials[]
    /** Professional affiliations */
    affiliations: AuthorAffiliation[]
    /** Areas of expertise/specialization */
    specialties: string[]
    /** Years of experience */
    yearsExperience?: number
    /** Number of procedures performed (for surgeons) */
    proceduresPerformed?: string
    /** Awards and recognitions */
    awards?: string[]
    /** Education history */
    education?: {
        degree: string
        institution: string
        year?: string | number
    }[]
    /** Languages spoken */
    languages?: string[]
    /** Social media links */
    socialLinks?: {
        twitter?: string
        linkedin?: string
        instagram?: string
        website?: string
    }
    /** Whether this author is a primary content creator */
    isPrimaryAuthor?: boolean
    /** Schema.org Person type - Physician for doctors */
    schemaType?: 'Person' | 'Physician'
}

/**
 * Static author data with extended E-E-A-T information
 *
 * This data is merged with database author records for display.
 */
export const authors: AuthorExtended[] = [
    {
        slug: 'editorial-team',
        name: 'Alluring Plastic Surgery Editorial Team',
        jobTitle: 'Editorial Team',
        shortBio:
            'Patient education from Alluring Plastic Surgery in Miami, written from named medical sources.',
        fullBio:
            "The Alluring Plastic Surgery Editorial Team writes patient education about cosmetic procedures. Figures in our articles come from named sources, such as the American Society of Plastic Surgeons, The Aesthetic Society, Cleveland Clinic, the FDA and peer-reviewed journals, and each article links to them. Our articles are general information, not medical advice: your own surgeon's instructions always come first.",
        credentials: [],
        affiliations: [
            {
                organization: 'Alluring Plastic Surgery',
                role: 'Editorial Team',
                url: 'https://www.alluringplasticsurgery.com',
            },
        ],
        specialties: ['Plastic Surgery Education', 'Patient Information'],
        isPrimaryAuthor: true,
        schemaType: 'Person',
    },
]

/**
 * Get author by slug
 */
export function getAuthorBySlug(slug: string): AuthorExtended | undefined {
    return authors.find((author) => author.slug === slug)
}

/**
 * Get all active authors
 */
export function getAllAuthors(): AuthorExtended[] {
    return authors
}

/**
 * Get primary authors (for bylines)
 */
export function getPrimaryAuthors(): AuthorExtended[] {
    return authors.filter((author) => author.isPrimaryAuthor)
}

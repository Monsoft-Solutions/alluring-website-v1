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
        jobTitle: 'Medical Content Team',
        shortBio:
            'Expert medical content written by board-certified plastic surgeons and reviewed by our editorial team.',
        fullBio:
            'The Alluring Plastic Surgery Editorial Team consists of board-certified plastic surgeons, medical writers, and healthcare professionals dedicated to providing accurate, trustworthy information about cosmetic procedures. All content is reviewed by our surgeons for medical accuracy.',
        credentials: [
            { title: 'Medical Content Review Board' },
            { title: 'HIPAA Compliance Certified' },
        ],
        affiliations: [
            {
                organization: 'Alluring Plastic Surgery',
                role: 'Editorial Team',
                url: 'https://alluringmiami.com',
            },
        ],
        specialties: [
            'Plastic Surgery Education',
            'Patient Information',
            'Medical Content',
        ],
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

/**
 * External profile links for E-E-A-T signals
 * These links help Google verify physician credentials and authority
 */
export interface SurgeonExternalProfiles {
    /** Healthgrades physician profile */
    healthgrades?: string
    /** RealSelf physician profile */
    realself?: string
    /** American Board of Plastic Surgery lookup */
    abps?: string
    /** LinkedIn professional profile */
    linkedin?: string
    /** WebMD physician profile */
    webmd?: string
    /** Vitals physician profile */
    vitals?: string
    /** Zocdoc physician profile */
    zocdoc?: string
}

export interface Surgeon {
    id: string
    name: string
    slug: string
    title: string
    shortBio: string
    fullBio: string
    quote?: string
    role: string
    images: {
        featured: string
        portrait: string
    }
    social?: {
        instagram?: string
        facebook?: string
        tiktok?: string
        linkedin?: string
    }
    /**
     * External profile links for SEO E-E-A-T signals
     * Used in PhysicianSchema sameAs property
     */
    externalProfiles?: SurgeonExternalProfiles
    education: string[]
    certifications: string[]
    certificationBadges?: { src: string; alt: string }[]
    specialties: string[]
    philosophy?: string
}
